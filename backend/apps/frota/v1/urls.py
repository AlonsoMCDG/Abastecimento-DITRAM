from rest_framework.routers import DefaultRouter
from .views import VeiculoViewSet, RotaViewSet, TipoCombustivelViewSet

router = DefaultRouter()

router.register(r'veiculos', VeiculoViewSet, basename='veiculo')
router.register(r'rotas', RotaViewSet, basename='rota')
router.register(r'tipos-combustivel', TipoCombustivelViewSet, basename='tipo-combustivel')

urlpatterns = router.urls
