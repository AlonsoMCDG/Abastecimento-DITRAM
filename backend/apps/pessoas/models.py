from django.db import models
from django.core.exceptions import ValidationError

class PessoaManager(models.Manager):
    def get_by_natural_key(self, cpf):
        return self.get(cpf=cpf)

class Pessoa(models.Model):
    FUNCAO_CHOICES = [
        ('MOTORISTA', 'Motorista'),
        ('BARQUEIRO', 'Barqueiro'),
        ('ROCADOR', 'Roçador'),
        ('BORRIFADOR', 'Borrifador'),
    ]
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=11, unique=True, verbose_name="CPF")
    funcao = models.CharField(max_length=50, choices=FUNCAO_CHOICES, verbose_name="Função")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    objects = PessoaManager()

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"

    def __str__(self):
        return f"{self.nome} ({self.get_funcao_display()})"

    def natural_key(self):
        return (self.cpf,)
    
    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
        
        if self.cpf:
            cpf_limpo = ''.join(filter(str.isdigit, str(self.cpf)))
            
            if len(cpf_limpo) != 11:
                # Interrompe o salvamento corretamente
                raise ValidationError({'cpf': 'O CPF deve conter exatamente 11 dígitos.'})
            else:
                self.cpf = cpf_limpo
            
        super().save(*args, **kwargs)