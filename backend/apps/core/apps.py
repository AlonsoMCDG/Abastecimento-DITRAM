from django.apps import AppConfig
from django.db.models.signals import post_migrate

def ensure_superuser_on_migrate(sender, **kwargs):
    """
    Função disparada automaticamente pelo Django após o término do 'migrate'.
    """
    from .seed import ensure_superadmin
    
    try:
        ensure_superadmin()
        print(" [Seed] Acesso superadmin garantido/verificado.") 
    except Exception as e:
        print(f" [Seed] Erro ao verificar superadmin: {e}")


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self):
        from . import signals

        signals.connect_model_cache_invalidation_signals()

        post_migrate.connect(ensure_superuser_on_migrate, sender=self.apps.get_app_config('auth'))
