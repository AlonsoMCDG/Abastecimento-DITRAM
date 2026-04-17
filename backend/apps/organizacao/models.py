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

    def __str__(self):
        return self.sigla

    def natural_key(self):
        return (self.sigla,)

    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = self.nome.strip()
        if self.sigla:
            self.sigla = self.sigla.strip().upper()
        super().save(*args, **kwargs)


class InstituicaoManager(models.Manager):
    def get_by_natural_key(self, nome, secretaria_sigla):
        return self.get(nome=nome, secretaria__sigla=secretaria_sigla)

class Instituicao(models.Model):
    TIPO_CHOICES = [
        ('ESCOLA', 'Escola'), ('CRECHE', 'Creche'),
        ('UPA', 'UPA'), ('HOSPITAL', 'Hospital'), ('OUTRO', 'Outro'),
    ]

    nome = models.CharField(max_length=100, verbose_name="Nome")
    tipo = models.CharField(max_length=100, choices=TIPO_CHOICES, verbose_name="Tipo", null=True, blank=True)
    secretaria = models.ForeignKey(Secretaria, on_delete=models.PROTECT, related_name="instituicoes")
    ativo = models.BooleanField(default=True, verbose_name="Ativa")

    objects = InstituicaoManager()

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"
        # Evita cadastrar a mesma escola duas vezes na mesma secretaria
        unique_together = ['nome', 'secretaria'] 

    def __str__(self):
        if self.tipo:
            return f"{self.nome} ({self.get_tipo_display()})"
        return self.nome

    def natural_key(self):
        # A chave natural depende da secretaria associada
        return (self.nome,) + self.secretaria.natural_key()
    natural_key.dependencies = ['organizacao.secretaria']

    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = " ".join(self.nome.split())
        super().save(*args, **kwargs)
