from django.db import models
from apps.organizacao.models import Secretaria

class TipoCombustivelManager(models.Manager):
    def get_by_natural_key(self, nome):
        return self.get(nome=nome)

class TipoCombustivel(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    ativo = models.BooleanField(default=True)
    
    objects = TipoCombustivelManager()

    class Meta:
        verbose_name = "Tipo de Combustível"
        verbose_name_plural = "Tipos de Combustível"

    def __str__(self):
        return self.nome

    def natural_key(self):
        return (self.nome,)


class VeiculoManager(models.Manager):
    def get_by_natural_key(self, placa):
        return self.get(placa=placa)

class Veiculo(models.Model):
    CATEGORIA_CHOICES = [
        ('CARRO', 'Carro'), 
        ('CAMINHONETE', 'Caminhonete'),
        ('ONIBUS', 'Ônibus'), 
        ('MOTO', 'Moto'), 
        ('VAN', 'Van'),
        ('MAQUINA_PESADA', 'Máquina Pesada/Trator')
    ]
    
    UNIDADE_CONSUMO_CHOICES = [
        ("KM_POR_L", "km/L"), 
        ("L_POR_H", "L/h")
    ]

    modelo = models.CharField(max_length=200)
    
    placa = models.CharField(max_length=8, unique=True)
    
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    
    hodometro_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Hodômetro Atual")
    
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES, default="KM_POR_L")
    consumo_estimado_combustivel = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    
    capacidade_carga_kg = models.FloatField(null=True, blank=True)
    capacidade_pessoas = models.IntegerField(null=True, blank=True)
    
    ativo = models.BooleanField(default=True)

    objects = VeiculoManager()

    class Meta:
        verbose_name = "Veículo (Frota)"
        verbose_name_plural = "Veículos (Frota)"

    def __str__(self):
        return f"{self.modelo} - {self.placa}"

    def natural_key(self):
        return (self.placa,)


class RotaManager(models.Manager):
    def get_by_natural_key(self, nome, secretaria_sigla):
        return self.get(nome=nome, secretaria__sigla=secretaria_sigla)

class Rota(models.Model):
    """
    Tabela de Rotas 'Inteligente'. 
    Serve apenas para sugerir caminhos conhecidos da secretaria e agilizar o preenchimento.
    """
    nome = models.CharField(max_length=255)
    secretaria = models.ForeignKey(Secretaria, on_delete=models.CASCADE, related_name="rotas_sugeridas")
    
    # Campos operacionais
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0, null=True, blank=True)
    detalhes = models.CharField(max_length=256, blank=True, null=True)
    ativa = models.BooleanField(default=True)

    objects = RotaManager()

    class Meta:
        verbose_name = "Rota Sugerida"
        verbose_name_plural = "Rotas Sugeridas"
        unique_together = ['nome', 'secretaria']

    def __str__(self):
        return f"{self.nome} ({self.secretaria.sigla})"

    def natural_key(self):
        return (self.nome, self.secretaria.sigla)
    
    natural_key.dependencies = ['organizacao.secretaria']