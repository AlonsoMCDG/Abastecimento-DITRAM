from django.db import models

class SecretariaManager(models.Manager):
    def get_by_natural_key(self, sigla):
        return self.get(sigla=sigla)

class Secretaria(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome")
    sigla = models.CharField(max_length=10, verbose_name="Sigla", unique=True) 
    ativo = models.BooleanField(default=True, verbose_name="Ativa")

    objects = SecretariaManager()

    class Meta:
        verbose_name = "Secretaria"
        verbose_name_plural = "Secretarias"
    
    def clean(self):
        if self.nome:
            self.nome = " ".join(self.nome.split())
        if self.sigla:
            self.sigla = "".join(self.sigla.split()).upper()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.sigla

    def natural_key(self):
        return (self.sigla,)


class InstituicaoManager(models.Manager):
    def get_by_natural_key(self, nome, secretaria_sigla):
        return self.get(nome=nome, secretaria__sigla=secretaria_sigla)

class Instituicao(models.Model):
    TIPO_CHOICES = [
        ('ESCOLA', 'Escola'), ('UPA', 'UPA'), 
        ('HOSPITAL', 'Hospital'), ('OUTRO', 'Outro'),
    ]
    nome = models.CharField(max_length=100, verbose_name="Nome")
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, verbose_name="Tipo", null=True, blank=True)
    secretaria = models.ForeignKey(Secretaria, on_delete=models.CASCADE, related_name="instituicoes")
    ativo = models.BooleanField(default=True, verbose_name="Ativa")
    
    objects = InstituicaoManager()

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"
        unique_together = ['nome', 'secretaria']
    
    def clean(self):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} ({self.secretaria.sigla})"

    def natural_key(self):
        return (self.nome,) + self.secretaria.natural_key()
    
    natural_key.dependencies = ['organizacao.secretaria']
