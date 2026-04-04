from django.db import models


class Secretaria(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome")
    sigla = models.CharField(max_length=10, verbose_name="Sigla")

    def __str__(self):
        return self.sigla

    class Meta:
        verbose_name = "Secretaria"
        verbose_name_plural = "Secretarias"


class Instituicao(models.Model):
    TIPO_CHOICES = [
        ('ESCOLA', 'Escola'),
        ('CRECHE', 'Creche'),
        ('UPA', 'UPA'),
        ('HOSPITAL', 'Hospital'),
        ('OUTRO', 'Outro'),
    ]

    nome = models.CharField(max_length=100, verbose_name="Nome")
    tipo = models.CharField(max_length=100, choices=TIPO_CHOICES, verbose_name="Tipo")

    secretaria = models.ForeignKey(
        Secretaria,
        on_delete=models.PROTECT,
        related_name="instituicoes"
    )

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"
