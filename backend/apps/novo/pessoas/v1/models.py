from django.db import models


class Pessoa(models.Model):
    # Considera max_length=14 para suportar a máscara '000.000.000-00'
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"

    def __str__(self):
        return f"{self.nome} ({self.cpf})"

