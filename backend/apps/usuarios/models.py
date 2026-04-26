from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def get_by_natural_key(self, cpf):
        return self.get(cpf=cpf)

    def create_user(self, cpf, password=None, **extra_fields):
        if not cpf:
            raise ValueError('O CPF é obrigatório')
        
        # Higienização: Garante que o CPF do usuário seja salvo apenas com números
        cpf_limpo = ''.join(filter(str.isdigit, str(cpf)))
        
        user = self.model(cpf=cpf_limpo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, cpf, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(cpf, password, **extra_fields)

class Usuario(AbstractUser):
    username = None
    
    cpf = models.CharField(max_length=11, unique=True, verbose_name="CPF")

    can_write_cadastros = models.BooleanField(default=False)
    can_write_frota = models.BooleanField(default=False)

    can_create_guia_abastecimento = models.BooleanField(default=True)
    can_edit_guia_abastecimento = models.BooleanField(default=False)
    can_delete_guia_abastecimento = models.BooleanField(default=False)

    USERNAME_FIELD = 'cpf' 
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UsuarioManager()

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
    
    def clean(self):
        if self.cpf:
            self.cpf = ''.join(filter(str.isdigit, str(self.cpf)))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.get_full_name() or self.cpf
