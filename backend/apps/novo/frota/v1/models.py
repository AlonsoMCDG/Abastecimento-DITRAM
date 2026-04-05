from django.db import models
from apps.novo.organizacao.v1.models import Secretaria, Instituicao

TIPO_LOCOMOCAO_CHOICES = [
    ("TERRESTRE", "Terrestre"),
    ("FLUVIAL", "Fluvial"),
]

class Veiculo(models.Model):
    TIPO_COMBUSTIVEL_CHOICES = [
        ("GASOLINA", "Gasolina"),
        ("DIESEL_S10", "Diesel S10"),
        ("DIESEL", "Diesel Comum"),
        ("ETANOL", "Etanol"),
        ("GNV", "GNV"),
    ]

    UNIDADE_CONSUMO_CHOICES = [
        ("KM_POR_L", "km/L"),
        ("L_POR_H", "L/h")
    ]

    modelo = models.CharField(max_length=100)
    placa = models.CharField(max_length=8, unique=True)
    tipo_locomocao = models.CharField(max_length=50, choices=TIPO_LOCOMOCAO_CHOICES)
    capacidade_carga_kg = models.FloatField()
    capacidade_pessoas = models.IntegerField()
    tipo_combustivel = models.CharField(max_length=50, choices=TIPO_COMBUSTIVEL_CHOICES,)
    consumo_estimado_combustivel = models.IntegerField()
    consumo_estimado_oleo = models.IntegerField()
    hodometro_atual = models.FloatField()
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES)

    secretaria = models.ForeignKey(
        Secretaria,
        on_delete=models.PROTECT,
        related_name="veiculos",
    )

    def __str__(self):
        return self.placa

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"

class Rota(models.Model):
    nome = models.CharField(max_length=100)

    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    consumo_estimado_combustivel = models.IntegerField(default=0)
    consumo_estimado_oleo = models.IntegerField(default=0)
    
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
