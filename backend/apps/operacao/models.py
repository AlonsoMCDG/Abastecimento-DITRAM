from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.db.models import Q

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao
from django.contrib.auth import get_user_model

User = get_user_model()


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
        # ('TERRESTRE', 'Terrestre'),
        # ('FLUVIAL', 'Fluvial'),
        ('ONIBUS', 'Ônibus'),
        ('CAMINHONETE', 'Caminhonete'),
        ('CARRO', 'Carro'),
        ('MOTO', 'Moto'),
        ('CATRAIA', 'Catraia'),
        ('COROTE', 'Corote'),
        # ('ROCAGEM', 'Roçagem'),
        # ('BORRIFACAO', 'Borrifação'),
        ('CARRO_PASSEIO', 'Carro Passeio'),
    ]
    modalidade = models.CharField(max_length=20, choices=MODALIDADE_CHOICES)
    
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas')

    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT)
    tipo_atividade = models.ForeignKey(TipoAtividade, on_delete=models.PROTECT)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, null=True, blank=True)
    
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, null=True, blank=True)
    rota_manual = models.CharField(max_length=255, null=True, blank=True)

    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT, related_name='guias')

    # Identificação do veículo
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, null=True, blank=True, related_name='guias')  
    tipo_veiculo = models.CharField(max_length=50, choices=TIPO_VEICULO_CHOICES, null=True, blank=True)  
    veiculo_descricao = models.CharField(max_length=100, null=True, blank=True)

    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT)
    quantidade_combustivel = models.DecimalField(max_digits=10, decimal_places=3)
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    periodo_uso_dias = models.PositiveIntegerField(null=True, blank=True)
    hodometro = models.PositiveIntegerField(null=True, blank=True, verbose_name="Hodômetro")
    hodometro_quebrado = models.BooleanField(default=False, verbose_name="Hodômetro Quebrado")
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
                name="guia_veiculo_fk_ou_dupla_avulsa",
                condition=Q(veiculo__isnull=False, tipo_veiculo__isnull=True, veiculo_descricao__isnull=True) |
                          Q(veiculo__isnull=True, tipo_veiculo__isnull=False, veiculo_descricao__isnull=False)
            )
        ]

    def clean(self):
        # Regra de Validação do Veículo (Cadastrado vs Avulso)
        tem_fk = bool(self.veiculo)
        tem_tipo = bool(self.tipo_veiculo)
        tem_desc = bool(self.veiculo_descricao)

        if tem_fk:
            if tem_tipo or tem_desc:
                raise ValidationError("Se um veículo cadastrado for selecionado, os campos de categoria e descrição devem ficar em branco.")
        else:
            if not tem_tipo or not tem_desc:
                raise ValidationError("Para veículos avulsos ou embarcações, é obrigatório informar a descrição e a categoria.")

        # Regra de Rota
        if self.rota and self.rota.secretaria_id != self.secretaria_id:
            raise ValidationError("A rota deve pertencer à mesma secretaria da guia.")

        if self.hodometro_quebrado:
            self.hodometro = None
    
    @property
    def veiculo_display(self):
        if self.veiculo:
            return str(self.veiculo)
        if self.tipo_veiculo and self.tipo_veiculo:
            return f"{self.veiculo_descricao} ({self.get_tipo_veiculo_display()})"
        return self.veiculo_descricao
    
    def save(self, *args, **kwargs):
        self.full_clean()

        # Transforma texto manual em Rota fixa
        if self.rota_manual and not self.rota:
            nova_rota, created = Rota.objects.get_or_create(
                nome=self.rota_manual.strip().title(),
                secretaria=self.secretaria
            )
            self.rota = nova_rota
            self.rota_manual = None
            
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
        with transaction.atomic():

            self.distancia_percorrida = self.hodometro_final - self.hodometro_inicial

            if self.distancia_percorrida < 0:
                raise ValidationError("Hodômetro final não pode ser menor que o inicial.")

            super().save(*args, **kwargs)

            if self.guia.veiculo:
                veiculo = self.guia.veiculo

                if self.hodometro_final > veiculo.hodometro_atual:
                    veiculo.hodometro_atual = self.hodometro_final
                    veiculo.save()
