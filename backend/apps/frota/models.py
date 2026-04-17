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

    # === CAMPOS OBRIGATÓRIOS (O Mínimo Viável) ===
    modelo = models.CharField(max_length=100)
    hodometro_atual = models.FloatField(verbose_name="Hodômetro Inicial")
    
    # FKs Obrigatórias
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name="veiculos")
    tipo_veiculo = models.ForeignKey(TipoVeiculo, on_delete=models.PROTECT, related_name="veiculos")
    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT, related_name="veiculos")

    # Campo obrigatório, mas com default para poupar o clique do usuário
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES, default="KM_POR_L")
    ativo = models.BooleanField(default=True)

    # === CAMPOS OPCIONAIS (Ficha Técnica e Casos Específicos) ===
    
    # Placa (barqueiros não têm)
    placa = models.CharField(max_length=8, unique=True, null=True, blank=True)
    
    # Textos
    tipo_locomocao = models.CharField(max_length=50, choices=TIPO_LOCOMOCAO_CHOICES, blank=True)
    
    # Numéricos
    capacidade_carga_kg = models.FloatField(null=True, blank=True, verbose_name="Capacidade de Carga (kg)")
    capacidade_pessoas = models.IntegerField(null=True, blank=True, verbose_name="Capacidade de Pessoas")
    
    consumo_estimado_combustivel = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True,
        blank=True,
        verbose_name="Consumo Estimado (Combustível)"
    )
    consumo_estimado_oleo = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True, 
        blank=True,
        verbose_name="Consumo Estimado (Óleo)"
    )

    def __str__(self):
        if self.placa:
            return f"{self.modelo} - {self.placa}"
        return self.modelo

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"

class Rota(models.Model):
    # === CAMPOS OBRIGATÓRIO (O Mínimo Viável) ===
    nome = models.CharField(max_length=100)

    # === CAMPOS AUTOMÁTICOS (Não exigem esforço do usuário) ===
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tipo_locomocao = models.CharField(
        max_length=50,
        choices=TIPO_LOCOMOCAO_CHOICES,
        default='TERRESTRE'
    )
    ativa = models.BooleanField(default=True)

    # === CAMPOS OPCIONAIS (Ficha Técnica e Organização) ===
    
    consumo_estimado_combustivel = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True,            # Adicionado
        blank=True,           # Adicionado
        verbose_name="Consumo Estimado (Combustível)"
    )
    
    consumo_estimado_oleo = models.DecimalField(
        max_digits=10, 
        decimal_places=3, 
        null=True, 
        blank=True,
        verbose_name="Consumo Estimado (Óleo)"
    )

    detalhes = models.CharField(max_length=256, blank=True, null=True)
    
    # Filtros e Agrupamentos organizacionais
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

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Rota"
        verbose_name_plural = "Rotas"
