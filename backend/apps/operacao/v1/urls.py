from rest_framework.routers import DefaultRouter
from .views import GuiaAbastecimentoViewSet, TipoAtividadeViewSet

router = DefaultRouter()

# =========================================================
# OPERAÇÃO (CORE DOMAIN API)
# =========================================================
# Recursos principais:
# - GuiaAbastecimento (transações)
# - TipoAtividade (catálogo dinâmico com deduplicação)
#
# Endpoints auxiliares:
# - /atividades/lookup/ (autocomplete frontend)
# =========================================================

router.register(r'atividades', TipoAtividadeViewSet, basename='tipo-atividade')
router.register(r'guias', GuiaAbastecimentoViewSet, basename='guia')

urlpatterns = router.urls
