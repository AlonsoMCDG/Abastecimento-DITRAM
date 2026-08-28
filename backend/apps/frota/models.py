from django.db import models
from django.core.validators import MinValueValidator
from apps.organizacao.models import Secretaria
from django.utils.text import slugify
from decimal import Decimal
class TipoCombustivelManager(models.Manager):
    def get_by_natural_key(self, nome):
        return self.get(nome=nome)

class TipoCombustivel(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    ativo = models.BooleanField(default=True)
    slug = models.SlugField(max_length=30, unique=True, blank=True)  # Apelido padronizado para o nome

    objects = TipoCombustivelManager()

    class Meta:
        verbose_name = "Tipo de Combustível"
        verbose_name_plural = "Tipos de Combustível"
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['ativo']),
        ]

    def __str__(self):
        return self.nome
    
    def clean(self):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
            
    def save(self, *args, **kwargs):
        
        if not self.slug:
            self.slug = slugify(self.nome)

        self.full_clean()
        super().save(*args, **kwargs)

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
        ('CAMINHAO', 'Caminhão'),
        ('MAQUINA_PESADA', 'Máquina Pesada/Trator'),
        # ('BARCO', 'Barco'),
    ]
    
    UNIDADE_CONSUMO_CHOICES = [
        ("KM_POR_L", "km/L"), 
        ("L_POR_H", "L/h")
    ]

    modelo = models.CharField(max_length=200)
    placa = models.CharField(max_length=9, unique=True)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES)
    
    hodometro_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                          validators=[MinValueValidator(Decimal('0.0'))], 
                                          verbose_name="Hodômetro Atual")
    
    unidade_consumo = models.CharField(max_length=20, choices=UNIDADE_CONSUMO_CHOICES, default="KM_POR_L")
    consumo_estimado_combustivel = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    consumo_estimado_oleo = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    tipo_combustivel = models.ForeignKey(TipoCombustivel, on_delete=models.PROTECT, related_name="veiculos")
    
    
    capacidade_carga_kg = models.FloatField(null=True, blank=True)
    capacidade_pessoas = models.IntegerField(null=True, blank=True)
    
    ativo = models.BooleanField(default=True)

    objects = VeiculoManager()

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"
        indexes = [
            models.Index(fields=['placa']),
            models.Index(fields=['modelo']),
            models.Index(fields=['ativo']),
            models.Index(fields=['categoria']),
        ]

    def clean(self):
        # Normaliza a placa: remove traços/espaços e passa a maiúsculas
        if self.placa:
            self.placa = ''.join(carater for carater in self.placa if carater.isalnum()).upper()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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
    slug = models.SlugField(max_length=255, editable=False)  # comentário: uso interno
    
    secretaria = models.ForeignKey(Secretaria, on_delete=models.CASCADE, related_name="rotas_sugeridas")
    
    # Campos operacionais
    distancia_km = models.DecimalField(max_digits=8, decimal_places=2, 
                                       validators=[MinValueValidator(Decimal('0.0'))], 
                                       default=0, null=True, blank=True)
    detalhes = models.CharField(max_length=256, blank=True, null=True)
    ativa = models.BooleanField(default=True)

    objects = RotaManager()

    class Meta:
        verbose_name = "Rota"
        verbose_name_plural = "Rotass"
        unique_together = ['nome', 'secretaria']

        constraints = [
            models.UniqueConstraint(
                fields=['slug', 'secretaria'],
                name='unique_slug_por_secretaria'
            )
        ]
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['secretaria']),
            models.Index(fields=['ativa']),
        ]

    def clean(self):
        if self.nome:
            self.nome = " ".join(self.nome.split())


    def save(self, *args, **kwargs):
        from django.utils.text import slugify

        print(
            f"[ROTA] ANTES: pk={self.pk}, "
            f"nome={self.nome!r}, "
            f"slug={self.slug!r}, "
            f"secretaria={self.secretaria_id}",
            flush=True
        )

        self.full_clean()

        if not self.slug:
            base_slug = slugify(self.nome)
            slug = base_slug
            counter = 1

            while Rota.objects.filter(
                slug=slug,
                secretaria=self.secretaria
            ).exists():
                print(f"[ROTA] Slug {slug!r} já existe", flush=True)
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        print(
            f"[ROTA] DEPOIS: pk={self.pk}, slug={self.slug!r}",
            flush=True
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.secretaria.sigla})"

    def natural_key(self):
        return (self.nome, self.secretaria.sigla)
    
    natural_key.dependencies = ['organizacao.secretaria']