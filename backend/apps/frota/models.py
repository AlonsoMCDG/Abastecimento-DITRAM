from django.db import models
from apps.organizacao.models import Secretaria, Instituicao

TIPO_LOCOMOCAO_CHOICES = [
    ("TERRESTRE", "Terrestre"),
    ("FLUVIAL", "Fluvial"),
]

class TipoCombustivel(models.Model):
    nome = models.CharField(max_length=50, unique=True) # Ex: Gasolina, Diesel S10
    ativo = models.BooleanField(default=True)

class TipoVeiculo(models.Model):
    nome = models.CharField(max_length=50, unique=True) # Ex: Ônibus, Carro, Moto

class Veiculo(models.Model):

    UNIDADE_CONSUMO_CHOICES = [
        ("KM_POR_L", "km/L"),
        ("L_POR_H", "L/h")
    ]

    modelo = models.CharField(max_length=100)
    placa = models.CharField(max_length=8, unique=True)
    tipo_locomocao = models.CharField(max_length=50, choices=TIPO_LOCOMOCAO_CHOICES)
    capacidade_carga_kg = models.FloatField()
    capacidade_pessoas = models.IntegerField()
    consumo_estimado_combustivel = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        verbose_name="Consumo Estimado (Combustível)"
    )
    consumo_estimado_oleo = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True, 
        blank=True,
        verbose_name="Consumo Estimado (Óleo)"
    )
    hodometro_atual = models.FloatField()
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES)

    secretaria = models.ForeignKey(
        Secretaria,
        on_delete=models.PROTECT,
        related_name="veiculos",
    )

    tipo_veiculo = models.ForeignKey(
        TipoVeiculo, 
        on_delete=models.PROTECT,
        related_name="veiculos"
    )

    tipo_combustivel = models.ForeignKey(
        TipoCombustivel,
        on_delete=models.PROTECT,
        related_name="veiculos"
    )
    

    def __str__(self):
        return self.placa

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"

class Rota(models.Model):
    nome = models.CharField(max_length=100)

    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    consumo_estimado_combustivel = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        verbose_name="Consumo Estimado (Combustível)"
    )
    consumo_estimado_oleo = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True, 
        blank=True,
        verbose_name="Consumo Estimado (Óleo)"
    )

    detalhes = models.CharField(max_length=256)
    
    tipo_locomocao = models.CharField(
        max_length=50,
        choices=TIPO_LOCOMOCAO_CHOICES
    )

    secretaria = models.ForeignKey(
        Secretaria,
        on_delete=models.PROTECT,
        related_name="rotas",
        null=True,
        blank=True,
    )

    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.PROTECT,
        related_name="rotas",
        null=True,
        blank=True,
    )

    ativa = models.BooleanField(default=True)

    def __str__(self):
        return self.descricao

    class Meta:
        verbose_name = "Rota"
        verbose_name_plural = "Rotas"
