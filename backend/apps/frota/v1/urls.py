from rest_framework.routers import DefaultRouter
from .views import VeiculoViewSet, RotaViewSet, TipoCombustivelViewSet, TipoVeiculoViewSet

router = DefaultRouter()

router.register(r'veiculos', VeiculoViewSet, basename='veiculo')
router.register(r'rotas', RotaViewSet, basename='rota')
router.register(r'tipos-combustivel', TipoCombustivelViewSet, basename='tipo-combustivel')
router.register(r'tipos-veiculo', TipoVeiculoViewSet, basename='tipo-veiculo')

urlpatterns = router.urls
