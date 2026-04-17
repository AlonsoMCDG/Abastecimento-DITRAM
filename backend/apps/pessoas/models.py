from django.db import models

class Pessoa(models.Model):
    cpf = models.CharField(
        max_length=11, 
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
        if self.cpf and len(self.cpf) == 11:
            cpf_formatado = f"{self.cpf[:3]}.{self.cpf[3:6]}.{self.cpf[6:9]}-{self.cpf[9:]}"
            return f"{self.nome} ({cpf_formatado})"
        return self.nome

    def save(self, *args, **kwargs):
        if self.nome:
            self.nome = " ".join(self.nome.split()).title()
        
        if self.cpf:
            # Extrai apenas os números, removendo qualquer máscara que venha do frontend
            cpf_limpo = ''.join(filter(str.isdigit, str(self.cpf)))
            
            if cpf_limpo == "":
                self.cpf = None
            else:
                self.cpf = cpf_limpo
        else:
            self.cpf = None 
            
        super().save(*args, **kwargs)
