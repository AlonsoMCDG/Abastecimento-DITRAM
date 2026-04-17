from django.db import models
from apps.organizacao.models import Secretaria, Instituicao

TIPO_LOCOMOCAO_CHOICES = [
    ("TERRESTRE", "Terrestre"), ("FLUVIAL", "Fluvial"),
]

class TipoManager(models.Manager):
    def get_by_natural_key(self, nome):
        return self.get(nome=nome)

class TipoCombustivel(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    ativo = models.BooleanField(default=True)
    
    objects = TipoManager()
    def natural_key(self): return (self.nome,)
    def __str__(self): return self.nome

class TipoVeiculo(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    
    objects = TipoManager()
    def natural_key(self): return (self.nome,)
    def __str__(self): return self.nome

# ---
# ATENÇÃO SOBRE O VEÍCULO: Como a placa é opcional, 
# a Natural Key do veículo precisa ser a união do modelo com a placa (se existir).
# Não é a NK mais limpa do mundo, mas protege o barco e o carro.
class VeiculoManager(models.Manager):
    def get_by_natural_key(self, modelo, placa):
        return self.get(modelo=modelo, placa=placa)

class Veiculo(models.Model):
    UNIDADE_CONSUMO_CHOICES = [("KM_POR_L", "km/L"), ("L_POR_H", "L/h")]

    modelo = models.CharField(max_length=200)
    hodometro_atual = models.FloatField(verbose_name="Hodômetro Inicial")
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name="veiculos")
    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT, related_name="veiculos")
    tipo_veiculo = models.ForeignKey(TipoVeiculo, on_delete=models.PROTECT, related_name="veiculos", null=True, blank=True)
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES, default="KM_POR_L")
    ativo = models.BooleanField(default=True)
    
    placa = models.CharField(max_length=8, unique=True, null=True, blank=True)
    tipo_locomocao = models.CharField(max_length=50, choices=TIPO_LOCOMOCAO_CHOICES, blank=True)
    capacidade_carga_kg = models.FloatField(null=True, blank=True)
    capacidade_pessoas = models.IntegerField(null=True, blank=True)
    
    consumo_estimado_combustivel = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    consumo_estimado_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    objects = VeiculoManager()

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"
        unique_together = ['modelo', 'placa'] # Garante a integridade da Natural Key

    def natural_key(self):
        return (self.modelo, self.placa)

    def __str__(self):
        if self.placa: return f"{self.modelo} - {self.placa}"
        return self.modelo


class RotaManager(models.Manager):
    def get_by_natural_key(self, nome, instituicao_nome=None, secretaria_sigla=None):
        if instituicao_nome:
            return self.get(
                nome=nome, 
                instituicao__nome=instituicao_nome, 
                instituicao__secretaria__sigla=secretaria_sigla
            )
        # Fallback caso a rota não tenha instituição (seja genérica da secretaria)
        elif secretaria_sigla:
            return self.get(nome=nome, instituicao__isnull=True, secretaria__sigla=secretaria_sigla)
        
        return self.get(nome=nome, instituicao__isnull=True, secretaria__isnull=True)

class Rota(models.Model):
    nome = models.CharField(max_length=100)
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tipo_locomocao = models.CharField(max_length=50, choices=TIPO_LOCOMOCAO_CHOICES, default='TERRESTRE')
    ativa = models.BooleanField(default=True)
    
    consumo_estimado_combustivel = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    consumo_estimado_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    detalhes = models.CharField(max_length=256, blank=True, null=True)
    
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name="rotas", null=True, blank=True)
    instituicao = models.ForeignKey(Instituicao, on_delete=models.PROTECT, related_name="rotas", null=True, blank=True)

    objects = RotaManager()

    class Meta:
        verbose_name = "Rota"
        verbose_name_plural = "Rotas"
        # A combinação dos dois não pode se repetir
        unique_together = ['nome', 'instituicao']

    def natural_key(self):
        # A chave natural agora repassa as chaves dos pais
        if self.instituicao:
            return (self.nome,) + self.instituicao.natural_key()
        elif self.secretaria:
            return (self.nome, None, self.secretaria.sigla)
        return (self.nome, None, None)

    natural_key.dependencies = ['organizacao.instituicao', 'organizacao.secretaria']
    
    def __str__(self):
        return self.nome
