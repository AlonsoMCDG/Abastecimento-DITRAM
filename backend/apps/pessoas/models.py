from django.db import models
from django.core.exceptions import ValidationError


class PessoaManager(models.Manager):
    def get_by_natural_key(self, cpf):
        return self.get(cpf=cpf)

class Pessoa(models.Model):
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    cpf = models.CharField(max_length=11, unique=True, verbose_name="CPF")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    objects = PessoaManager()

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"
        ordering = ['-ativo', 'nome']
        indexes = [
            models.Index(fields=['nome']),   # comentário: melhora search
            models.Index(fields=['cpf']),    # comentário: filtro frequente
            models.Index(fields=['ativo']),  # comentário: lookup padrão
        ]

    def format_nome(self, nome):
        palavras = ['da', 'de', 'do', 'das', 'dos']
        return ' '.join(
            w if w.lower() in palavras else w.capitalize()
            for w in nome.split()
        )

    def clean(self):
        if self.nome:
            self.nome = self.format_nome(self.nome)
        
        if self.cpf:
            cpf_limpo = ''.join(filter(str.isdigit, str(self.cpf)))
            if len(cpf_limpo) != 11:
                raise ValidationError({'cpf': 'O CPF deve conter exatamente 11 dígitos numéricos.'})
            self.cpf = cpf_limpo
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.cpf})"

    def natural_key(self):
        return (self.cpf,)
