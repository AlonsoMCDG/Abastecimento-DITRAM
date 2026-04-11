from django.db import models
from django.db.transaction import atomic

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoVeiculo, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao

class TipoServico(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Serviço")

    class Meta:
        verbose_name = "Tipo de Serviço"
        verbose_name_plural = "Tipos de Serviço"

    def __str__(self):
        return self.nome


class AlocacaoServico(models.Model):
    """Relacionamento entre PESSOA e TIPO_SERVICO"""
    pessoa = models.ForeignKey(Pessoa, on_delete=models.CASCADE, related_name='servicos_alocados', verbose_name='Pessoa')
    tipo_servico = models.ForeignKey(TipoServico, on_delete=models.PROTECT, related_name='pessoas_alocadas', verbose_name='Tipo de Serviço')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='pessoas_alocadas', verbose_name='Secretaria')
    
    is_principal = models.BooleanField(default=False, verbose_name="É o serviço principal?")

    class Meta:
        # unique_together garante que uma pessoa não possa ter o mesmo serviço repetido
        unique_together = ['pessoa', 'tipo_servico']
        verbose_name = "Alocação de Serviço"
        verbose_name_plural = "Alocações de Serviço"

    def __str__(self):
        principal_str = "⭐ Principal" if self.is_principal else "Secundário"
        return f"{self.pessoa.nome} -> {self.tipo_servico.nome} [{principal_str}]"

    @atomic
    def save(self, *args, **kwargs):
        # REGRA DE NEGÓCIO: Se esta alocação é a principal, remove o status de principal das outras
        if self.is_principal:
            AlocacaoServico.objects.filter(pessoa=self.pessoa).exclude(pk=self.pk).update(is_principal=False)
        
        # Se for a PRIMEIRA alocação da pessoa, força ser a principal
        elif not self.pk and not AlocacaoServico.objects.filter(pessoa=self.pessoa).exists():
            self.is_principal = True

        super().save(*args, **kwargs)


class OperadorVeiculo(models.Model):
    """Vínculo entre o Motorista (Pessoa) e o Veículo"""
    pessoa = models.ForeignKey(Pessoa, on_delete=models.CASCADE, related_name='veiculos_operados', verbose_name='Pessoa')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='operadores', verbose_name='Veículo')
    is_principal = models.BooleanField(default=False, verbose_name="É o operador principal?")

    class Meta:
        unique_together = ['pessoa', 'veiculo']
        verbose_name = "Operador de Veículo"
        verbose_name_plural = "Operadores de Veículos"

    def __str__(self):
        return f"{self.pessoa.nome} -> {self.veiculo.placa}"

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Guia(models.Model):
    """Registro de Abastecimento/Serviço da Frota"""
    data_hora = models.DateTimeField(verbose_name="Data e Hora")

    # ==========================================
    # REFERÊNCIAS PRINCIPAIS
    # ==========================================
    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT, related_name='guias', verbose_name='Motorista')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, related_name='guias', verbose_name='Veículo')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='guias', verbose_name='Secretaria')
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, related_name='guias', verbose_name='Instituição')

    # Desnormalização histórica: garante que saibamos o que era no dia da guia
    tipo_veiculo = models.ForeignKey(TipoVeiculo, on_delete=models.PROTECT, related_name='guias')
    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT, related_name='guias')

    # ==========================================
    # CAMPOS COM TEXTO GENÉRICO (Fallback)
    # ==========================================
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, related_name='guias', null=True, blank=True)
    rota_texto = models.CharField(max_length=200, null=True, blank=True)

    tipo_servico = models.ForeignKey(TipoServico, on_delete=models.PROTECT, related_name='guias')
    tipo_servico_texto = models.CharField(max_length=200, null=True, blank=True)

    # ==========================================
    # VOLUMES (Combustível com 3 casas, Óleo com 2)
    # ==========================================
    quantidade_combustivel = models.DecimalField(max_digits=10, decimal_places=3, verbose_name="Qtd Combustível (L)")
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Qtd Óleo (L)")
    periodo_uso_dias = models.PositiveIntegerField(null=True, blank=True, verbose_name="Período de Uso (dias)")

    # ==========================================
    # HODÔMETROS (Alterado para DecimalField)
    # ==========================================
    hodometro_atual = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Hodômetro Atual")
    hodometro_anterior = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Hodômetro Anterior")
    distancia_percorrida = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Distância Percorrida")

    # ==========================================
    # AUDITORIA E EXTRAS
    # ==========================================
    observacao = models.TextField(max_length=256, null=True, blank=True)
    
    # Rastreabilidade de quem emitiu a guia no sistema
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, related_name='guias_emitidas', verbose_name="Emitido por")
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] # Facilita listar as mais recentes primeiro

    def __str__(self):
        return f"Guia #{self.id} - {self.veiculo} - {self.data_hora.strftime('%d/%m/%Y')}"


    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] # Padrão: mais recentes primeiro
    
    def __str__(self):
        return f"Guia {self.id} - {self.veiculo.placa} ({self.data_hora.strftime('%d/%m/%Y')})"


