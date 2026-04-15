from django.db import models

class Pessoa(models.Model):
    # Considera max_length=14 para suportar a máscara '000.000.000-00'
    cpf = models.CharField(
        max_length=14, 
        unique=True, 
        null=True, 
        blank=True, 
        verbose_name="CPF"
    )
    nome = models.CharField(max_length=200, verbose_name="Nome Completo")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    class Meta:
        verbose_name = "Pessoa"
        verbose_name_plural = "Pessoas"

    def __str__(self):
        if self.cpf:
            return f"{self.nome} ({self.cpf})"
        return self.nome

    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
        
        # Tratamento para o UNIQUE=TRUE
        if self.cpf:
            self.cpf = self.cpf.strip()
            # Se após o strip() a string ficar vazia, converte para None
            if self.cpf == "":
                self.cpf = None
        else:
            # Se vier vazio do frontend, garante que seja None e não ""
            self.cpf = None 
            
        super().save(*args, **kwargs)