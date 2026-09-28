from rest_framework.routers import DefaultRouter
from .views import (
    GuiaAbastecimentoViewSet,
    TipoAtividadeViewSet,
    RegistroHodometroDiarioViewSet,
)

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
# Registros de hodômetro diário (ViewSet/Service já existiam, mas não
# estavam roteados — endpoint inacessível por qualquer cliente)
router.register(r'registros-hodometro', RegistroHodometroDiarioViewSet, basename='registro-hodometro')

urlpatterns = router.urls
