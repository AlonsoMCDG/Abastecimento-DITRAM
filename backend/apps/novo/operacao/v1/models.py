from django.db import models

from apps.novo.pessoas.v1.models import Pessoa
from apps.novo.frota.v1.models import Veiculo, Rota
from apps.novo.organizacao.v1.models import Secretaria

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
    is_principal = models.BooleanField(default=False, verbose_name="É o serviço principal?")

    class Meta:
        # unique_together garante que uma pessoa não possa ter o mesmo serviço repetido
        unique_together = ['pessoa', 'tipo_servico']
        verbose_name = "Alocação de Serviço"
        verbose_name_plural = "Alocações de Serviço"

    def __str__(self):
        principal_str = "⭐ Principal" if self.is_principal else "Secundário"
        return f"{self.pessoa.nome} -> {self.tipo_servico.nome} [{principal_str}]"


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


class Guia(models.Model):
    """Registro de Abastecimento/Serviço da Frota"""
    data_hora = models.DateTimeField(verbose_name="Data e Hora")

    pessoa = models.ForeignKey(Pessoa, on_delete=models.PROTECT, related_name='guias', verbose_name='Pessoa')
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, related_name='guias', verbose_name='Veículo')
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name='guias', verbose_name='Secretaria')

    # Rota e Tipo de Serviço podem ser opcionais dependendo da regra de negócio, 
    # mas mantive obrigatórios conforme seu escopo. Se puderem ser nulos, adicione null=True, blank=True
    rota = models.ForeignKey(Rota, on_delete=models.PROTECT, related_name='guias', null=True, blank=True)
    tipo_servico = models.ForeignKey(TipoServico, on_delete=models.PROTECT, related_name='guias')

    quantidade_combustivel = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Qtd Combustível (L)")
    quantidade_oleo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Qtd Óleo (L)")
    hodometro_atual = models.PositiveIntegerField(verbose_name="Hodômetro")

    class Meta:
        verbose_name = "Guia de Abastecimento"
        verbose_name_plural = "Guias de Abastecimento"
        ordering = ['-data_hora'] # Padrão: mais recentes primeiro
    
    def __str__(self):
        return f"Guia {self.id} - {self.veiculo.placa} ({self.data_hora.strftime('%d/%m/%Y')})"


