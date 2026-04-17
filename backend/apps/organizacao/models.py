from django.db import models


from django.db import models

class Secretaria(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome")
    sigla = models.CharField(max_length=10, verbose_name="Sigla")
    ativo = models.BooleanField(default=True, verbose_name="Ativa")

    def __str__(self):
        return self.sigla

    class Meta:
        verbose_name = "Secretaria"
        verbose_name_plural = "Secretarias"

    def save(self, *args, **kwargs):
        # Higienização de dados
        if self.nome:
            self.nome = self.nome.strip() # Remove espaços sobrando no início e fim
        if self.sigla:
            self.sigla = self.sigla.strip().upper() # Força a sigla a ser sempre MAIÚSCULA
            
        super().save(*args, **kwargs)


class Instituicao(models.Model):
    TIPO_CHOICES = [
        ('ESCOLA', 'Escola'),
        ('CRECHE', 'Creche'),
        ('UPA', 'UPA'),
        ('HOSPITAL', 'Hospital'),
        ('OUTRO', 'Outro'),
    ]

    nome = models.CharField(max_length=100, verbose_name="Nome")
    tipo = models.CharField(max_length=100, choices=TIPO_CHOICES, verbose_name="Tipo", null=True, blank=True)
    
    secretaria = models.ForeignKey(
        Secretaria, # Importado diretamente no topo
        on_delete=models.PROTECT,
        related_name="instituicoes"
    )
    
    ativo = models.BooleanField(default=True, verbose_name="Ativa")

    def __str__(self):
        if self.tipo:
            return f"{self.nome} ({self.get_tipo_display()})"
        return self.nome
        

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"

    def save(self, *args, **kwargs):
        # Higienização: Remove espaços duplos e espaços nas pontas
        if self.nome:
            self.nome = " ".join(self.nome.split())
        super().save(*args, **kwargs)
