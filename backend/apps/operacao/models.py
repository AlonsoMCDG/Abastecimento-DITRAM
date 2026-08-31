from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth import get_user_model

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao

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


class GuiaAbastecimento(models.Model):
    TIPO_VEICULO_CHOICES = [
        ('CARRO', 'Carro'), ('CAMINHONETE', 'Caminhonete'), ('ONIBUS', 'Ônibus'), ('MOTO', 'Moto'),
        ('VAN', 'Van'), ('CATRAIA', 'Catraia (Embarcação)'), ('MAQUINA_PESADA', 'Máquina Pesada/Trator'),
    ]

    MODALIDADE_CHOICES = [
        ('ONIBUS', 'Ônibus'), ('CAMINHONETE', 'Caminhonete'), ('CARRO', 'Carro'),
        ('MOTO', 'Moto'), ('CATRAIA', 'Catraia'), ('COROTE', 'Corote'), ('CARRO_PASSEIO', 'Carro Passeio'),
    ]

    data_hora = models.DateTimeField(verbose_name="Data e Hora")
    modalidade = models.CharField(max_length=20, choices=MODALIDADE_CHOICES)
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT)
    tipo_atividade = models.ForeignKey(TipoAtividade, on_delete=models.PROTECT)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, null=True, blank=True)
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, null=True, blank=True)
    rota_manual = models.CharField(max_length=255, null=True, blank=True)
    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT, related_name='guias')
    
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

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora']
        constraints = [
            models.CheckConstraint(
                name="guia_veiculo_fk_ou_dupla_avulsa",
                condition=Q(veiculo__isnull=False, tipo_veiculo__isnull=True, veiculo_descricao__isnull=True) |
                          Q(veiculo__isnull=True, tipo_veiculo__isnull=False, veiculo_descricao__isnull=False)
            )
        ]
    
    @property
    def veiculo_display(self):
        if self.veiculo:
            return str(self.veiculo)
        if self.tipo_veiculo and self.veiculo_descricao:
            return f"{self.veiculo_descricao} ({self.get_tipo_veiculo_display()})"
        return self.veiculo_descricao

    def __str__(self):
        return f"Guia #{self.id}: {self.pessoa} - {self.veiculo_display} - {self.quantidade_combustivel}L"


class RegistroHodometroDiario(models.Model):
    guia = models.ForeignKey(GuiaAbastecimento, on_delete=models.CASCADE, related_name='registros_diarios')
    data_referencia = models.DateField()
    hodometro_inicial = models.DecimalField(max_digits=10, decimal_places=2)
    hodometro_final = models.DecimalField(max_digits=10, decimal_places=2)
    distancia_percorrida = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
