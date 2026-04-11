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

    def save(self, *args, **kwargs):
        # Higienização de dados: Remove espaços extras nas pontas e deixa as Iniciais Maiúsculas
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
        
        # Garante que o CPF não tenha espaços acidentais
        if self.cpf:
            self.cpf = self.cpf.strip()
            
        super().save(*args, **kwargs)