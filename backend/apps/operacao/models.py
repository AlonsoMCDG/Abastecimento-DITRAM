from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.db.models import Q

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao
from django.contrib.auth import get_user_model

User = get_user_model()

VEICULO_XOR_CONDITION = Q(
    veiculo__isnull=False, tipo_veiculo__isnull=True, veiculo_descricao__isnull=True
) | Q(
    veiculo__isnull=True, tipo_veiculo__isnull=False, veiculo_descricao__isnull=True
) | Q(
    veiculo__isnull=True, tipo_veiculo__isnull=True, veiculo_descricao__isnull=False
)

class TipoAtividadeManager(models.Manager):
    def get_by_natural_key(self, nome):
        return self.get(nome=nome)

class TipoAtividade(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Atividade")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    
    objects = TipoAtividadeManager()

    class Meta:
        verbose_name = "Tipo de Atividade"
        verbose_name_plural = "Tipos de Atividade"

    def __str__(self): 
        return self.nome

    def natural_key(self):
        return (self.nome,)

    def save(self, *args, **kwargs):
        # Mantido do código antigo: padronização de texto
        if self.nome: 
            self.nome = " ".join(self.nome.split()).title()
        super().save(*args, **kwargs)


# ==========================================
# TRANSAÇÕES PRINCIPAIS
# ==========================================
class GuiaAbastecimento(models.Model):
    TIPO_VEICULO_CHOICES = [
        ('CARRO', 'Carro'), ('CAMINHONETE', 'Caminhonete'), ('ONIBUS', 'Ônibus'), ('MOTO', 'Moto'),
        ('VAN', 'Van'), ('BARCO', 'Barco'), ('MAQUINA_PESADA', 'Máquina Pesada/Trator'),
    ]

    data_hora = models.DateTimeField(verbose_name="Data e Hora")

    # Categoria operacional do abastecimento
    MODALIDADE_CHOICES = [
        ('TERRESTRE', 'Terrestre'), ('FLUVIAL', 'Fluvial'),
        ('ROCAGEM', 'Roçagem'), ('BORRIFACAO', 'Borrifação'), ('COROTE', 'Corote'),
    ]
    modalidade = models.CharField(max_length=20, choices=MODALIDADE_CHOICES)
    
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas')

    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT)
    tipo_atividade = models.ForeignKey(TipoAtividade, on_delete=models.PROTECT)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, null=True, blank=True)
    
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, null=True, blank=True)
    rota_manual = models.CharField(max_length=255, null=True, blank=True)

    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT)

    # Identificação do veículo. Apenas 1 dos 3 campos a seguir deve ser preenchido por guia.
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, null=True, blank=True)  # 1. Objeto Veiculo (salvo no banco)
    tipo_veiculo = models.CharField(max_length=50, choices=TIPO_VEICULO_CHOICES, null=True, blank=True)  # 2. Para barqueiros, usa esse campo (usa "Barco" genericamente para todos os barqueiros)
    veiculo_descricao = models.CharField(max_length=100, null=True, blank=True)  # 3. Descrição avulsa do veículo, quando os campos acima não são aplicáveis

    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT)
    quantidade_combustivel = models.DecimalField(max_digits=10, decimal_places=3)
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    periodo_uso_dias = models.PositiveIntegerField(null=True, blank=True)
    observacao = models.TextField(max_length=256, null=True, blank=True)
    
    # Rastreabilidade de sistema
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] # Ordenação mantida

        constraints = [
            models.CheckConstraint(
                name="guia_um_tipo_veiculo",
                condition=VEICULO_XOR_CONDITION
            )
        ]

    def clean(self):
        """Validação lógica antes de salvar no banco"""
        fields = [self.veiculo, self.tipo_veiculo, self.veiculo_descricao]

        if sum(bool(x) for x in fields) != 1:
            raise ValidationError("Informe exatamente um tipo de veículo.")
    
    @property
    def veiculo_display(self):
        if self.veiculo:
            return str(self.veiculo)
        if self.tipo_veiculo:
            return self.get_tipo_veiculo_display()
        return self.veiculo_descricao
    
    def save(self, *args, **kwargs):
        # Transforma texto manual em Rota fixa
        if self.rota_manual and not self.rota:
            nova_rota, created = Rota.objects.get_or_create(
                nome=self.rota_manual.strip().title(),
                secretaria=self.secretaria
            )
            self.rota = nova_rota
            self.rota_manual = None # Limpa o manual pois agora é oficial
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Guia #{self.id}: {self.pessoa} - {self.veiculo_display} - {self.quantidade_combustivel}L"


class RegistroHodometroDiario(models.Model):
    guia = models.ForeignKey(GuiaAbastecimento, on_delete=models.CASCADE, related_name='registros_diarios')
    data_referencia = models.DateField()
    hodometro_inicial = models.DecimalField(max_digits=10, decimal_places=2)
    hodometro_final = models.DecimalField(max_digits=10, decimal_places=2)
    distancia_percorrida = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.distancia_percorrida = self.hodometro_final - self.hodometro_inicial
        if self.distancia_percorrida < 0:
            raise ValidationError("Hodômetro final não pode ser menor que o inicial.")
        super().save(*args, **kwargs)

        # Sincroniza com o cadastro do Veículo
        if self.guia.veiculo:
            veiculo = self.guia.veiculo
            # Só atualiza se o novo hodômetro for maior que o atual (evita erro de lançamento retroativo)
            if self.hodometro_final > veiculo.hodometro_atual:
                veiculo.hodometro_atual = self.hodometro_final
                veiculo.save()
