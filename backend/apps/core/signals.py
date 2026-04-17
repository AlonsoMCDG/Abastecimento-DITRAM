import logging
from django.apps import apps
from django.db.models.signals import post_delete, post_save, m2m_changed
from django.dispatch import receiver

from .cache import bump_model_cache_version

# Configura o logger padrão do Django
logger = logging.getLogger(__name__)


def _invalidate_model_cache(sender, **kwargs):
    try:
        bump_model_cache_version(sender)
    except Exception as e:
        # Não quebra a requisição do usuário, mas avisa o desenvolvedor!
        logger.warning(f"Falha ao invalidar cache para o model {sender.__name__}: {e}")


def connect_model_cache_invalidation_signals():
    # Inclui auto_created=True para pegar as tabelas invisíveis geradas por campos ManyToMany
    for model in apps.get_models(include_auto_created=True):

        post_save.connect(
            _invalidate_model_cache, 
            sender=model, 
            weak=False, 
            dispatch_uid=f"cache_inv_save:{model._meta.label}"
        )
        
        post_delete.connect(
            _invalidate_model_cache, 
            sender=model, 
            weak=False, 
            dispatch_uid=f"cache_inv_del:{model._meta.label}"
        )

        m2m_changed.connect(
            _invalidate_model_cache, 
            sender=model, 
            weak=False, 
            dispatch_uid=f"cache_inv_m2m:{model._meta.label}"
        )
