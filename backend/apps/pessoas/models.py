from django.db import models
from django.core.exceptions import ValidationError


class Funcao(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.nome
    # FUNCAO_CHOICES = [
    #     ('MOTORISTA', 'Motorista'),
    #     ('BARQUEIRO', 'Barqueiro'),
    #     ('ROCADOR', 'Roçador'),
    #     ('BORRIFADOR', 'Borrifador'),
    # ]
class PessoaManager(models.Manager):
    def get_by_natural_key(self, cpf):
        return self.get(cpf=cpf)

class Pessoa(models.Model):
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=11, unique=True, verbose_name="CPF")
    funcoes = models.ManyToManyField(Funcao, related_name='pessoas', verbose_name="Função")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    objects = PessoaManager()

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"

    def clean(self):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
        
        if self.cpf:
            cpf_limpo = ''.join(filter(str.isdigit, str(self.cpf)))
            if len(cpf_limpo) != 11:
                raise ValidationError({'cpf': 'O CPF deve conter exatamente 11 dígitos numéricos.'})
            self.cpf = cpf_limpo
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.get_funcao_display()})"

    def natural_key(self):
        return (self.cpf,)
