from django.db import models, transaction
from django.core.exceptions import ValidationError
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
# PREFERÊNCIAS / AUTO-PREENCHIMENTO
# ==========================================
class AlocacaoServico(models.Model):
    pessoa = models.ForeignKey(Pessoa, on_delete=models.CASCADE, related_name='servicos_alocados')
    tipo_atividade = models.ForeignKey(TipoAtividade, on_delete=models.PROTECT, related_name='pessoas_alocadas')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='pessoas_alocadas')
    is_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ['pessoa', 'tipo_atividade']
        verbose_name = "Alocação de Atividade"
        verbose_name_plural = "Alocações de Atividades"

    def __str__(self):
        principal_str = "⭐ Principal" if self.is_principal else "Secundário"
        return f"{self.pessoa.nome} -> {self.tipo_atividade.nome} [{principal_str}]"

    @transaction.atomic
    def save(self, *args, **kwargs):
        if self.is_principal:
            AlocacaoServico.objects.filter(pessoa=self.pessoa).exclude(pk=self.pk).update(is_principal=False)
        elif not self.pk and not AlocacaoServico.objects.filter(pessoa=self.pessoa).exists():
            self.is_principal = True
        super().save(*args, **kwargs)


class OperadorVeiculo(models.Model):
    pessoa = models.ForeignKey(Pessoa, on_delete=models.CASCADE, related_name='veiculos_operados')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='operadores')
    is_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ['pessoa', 'veiculo']
        verbose_name = "Operador de Veículo"
        verbose_name_plural = "Operadores de Veículos"

    def __str__(self):
        principal_str = "⭐ Principal" if self.is_principal else "Secundário"
        return f"{self.pessoa.nome} -> {self.veiculo.modelo} [{principal_str}]"

    @transaction.atomic
    def save(self, *args, **kwargs):
        if self.is_principal:
            OperadorVeiculo.objects.filter(veiculo=self.veiculo).exclude(pk=self.pk).update(is_principal=False)
        elif not self.pk and not OperadorVeiculo.objects.filter(veiculo=self.veiculo).exists():
            self.is_principal = True
        super().save(*args, **kwargs)


# ==========================================
# TRANSAÇÕES PRINCIPAIS
# ==========================================
class GuiaAbastecimento(models.Model):
    MODALIDADE_CHOICES = [
        ('TERRESTRE', 'Terrestre'), ('FLUVIAL', 'Fluvial'),
        ('ROCAGEM', 'Roçagem'), ('BORRIFACAO', 'Borrifação'), ('COROTE', 'Corote'),
    ]

    data_hora = models.DateTimeField(verbose_name="Data e Hora")
    modalidade = models.CharField(max_length=20, choices=MODALIDADE_CHOICES)
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas')

    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT)
    tipo_atividade = models.ForeignKey(TipoAtividade, on_delete=models.PROTECT)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, null=True, blank=True)
    
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, null=True, blank=True)
    rota_manual = models.CharField(max_length=255, null=True, blank=True)

    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT)
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, null=True, blank=True)
    identificacao_avulsa = models.CharField(max_length=100, null=True, blank=True)

    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT)
    quantidade_litros = models.DecimalField(max_digits=10, decimal_places=3)
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    periodo_uso_dias = models.PositiveIntegerField(null=True, blank=True)
    observacao = models.TextField(max_length=256, null=True, blank=True)
    
    # Mantido do código antigo: Rastreabilidade de sistema
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] # Ordenação mantida

    def __str__(self):
        # Exibição aprimorada do código antigo
        identificador = self.veiculo.placa if self.veiculo else self.identificacao_avulsa or self.pessoa.nome
        return f"Guia #{self.id} - {identificador} - {self.data_hora.strftime('%d/%m/%Y')}"


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
