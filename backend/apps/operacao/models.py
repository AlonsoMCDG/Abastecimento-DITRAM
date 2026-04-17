from django.db import models, transaction
from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel, TipoVeiculo
from apps.organizacao.models import Secretaria, Instituicao
from django.contrib.auth import get_user_model

User = get_user_model()

class TipoServicoManager(models.Manager):
    def get_by_natural_key(self, nome):
        return self.get(nome=nome)

class TipoServico(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Serviço", unique=True)
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    objects = TipoServicoManager()

    class Meta:
        verbose_name = "Tipo de Serviço"
        verbose_name_plural = "Tipos de Serviço"

    def natural_key(self):
        return (self.nome,)

    def __str__(self): return self.nome

    def save(self, *args, **kwargs):
        if self.nome: self.nome = " ".join(self.nome.split()).title()
        super().save(*args, **kwargs)


class AlocacaoServico(models.Model):
    pessoa = models.ForeignKey(Pessoa, on_delete=models.CASCADE, related_name='servicos_alocados')
    tipo_servico = models.ForeignKey(TipoServico, on_delete=models.PROTECT, related_name='pessoas_alocadas')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='pessoas_alocadas')
    is_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ['pessoa', 'tipo_servico']
        verbose_name = "Alocação de Serviço"
        verbose_name_plural = "Alocações de Serviço"

    def __str__(self):
        principal_str = "⭐ Principal" if self.is_principal else "Secundário"
        return f"{self.pessoa.nome} -> {self.tipo_servico.nome} [{principal_str}]"

    @transaction.atomic
    def save(self, *args, **kwargs):
        # Se esta alocação é a principal, remove o status de principal das outras
        if self.is_principal:
            AlocacaoServico.objects.filter(pessoa=self.pessoa).exclude(pk=self.pk).update(is_principal=False)
        
        # Se for a PRIMEIRA alocação da pessoa, força ser a principal
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


# Nota: Dados transacionais como 'Guia' geralmente NÃO DEVEM ter Natural Keys.
# Eles devem ser gerados pelo sistema ou ter IDs gerados automaticamente em migrações.
class Guia(models.Model):
    data_hora = models.DateTimeField(verbose_name="Data e Hora")

    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT, related_name='guias')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, related_name='guias')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='guias')
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, related_name='guias')

    tipo_veiculo = models.ForeignKey(TipoVeiculo, on_delete=models.PROTECT, related_name='guias')
    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT, related_name='guias')

    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, related_name='guias', null=True, blank=True)
    rota_texto = models.CharField(max_length=200, null=True, blank=True)
    tipo_servico = models.ForeignKey(TipoServico, on_delete=models.PROTECT, related_name='guias')
    tipo_servico_texto = models.CharField(max_length=200, null=True, blank=True)

    quantidade_combustivel = models.DecimalField(max_digits=10, decimal_places=3)
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    periodo_uso_dias = models.PositiveIntegerField(null=True, blank=True)

    hodometro_atual = models.DecimalField(max_digits=10, decimal_places=2)
    hodometro_anterior = models.DecimalField(max_digits=10, decimal_places=2)
    distancia_percorrida = models.DecimalField(max_digits=10, decimal_places=2)

    observacao = models.TextField(max_length=256, null=True, blank=True)
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas')
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] 

    def __str__(self):
        identificador_veiculo = self.veiculo.placa if self.veiculo.placa else self.veiculo.modelo
        return f"Guia #{self.id} - {identificador_veiculo} - {self.data_hora.strftime('%d/%m/%Y')}"
