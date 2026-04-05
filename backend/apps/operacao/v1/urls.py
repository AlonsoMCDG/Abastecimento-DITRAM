from rest_framework.routers import DefaultRouter
from .views import OperadorVeiculoViewSet, GuiaViewSet, TipoServicoViewSet, AlocacaoServicoViewSet

router = DefaultRouter()

# Rota final: /api/v1/tipos-servico/
router.register(r'tipos-servico', TipoServicoViewSet, basename='tipo-servico')

# Rota final: /api/v1/alocacoes-servicos/
router.register(r'alocacoes-servicos', AlocacaoServicoViewSet, basename='alocacao-servico')

# Rota final: /api/v1/operadores-veiculos/
router.register(r'operadores-veiculos', OperadorVeiculoViewSet, basename='operador-veiculo')

# Rota final: /api/v1/guias/
router.register(r'guias', GuiaViewSet, basename='guia')

urlpatterns = router.urls
