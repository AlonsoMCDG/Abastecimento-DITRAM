from rest_framework.routers import DefaultRouter
from .views import VeiculoViewSet, RotaViewSet

router = DefaultRouter()

router.register(r'veiculos', VeiculoViewSet, basename='veiculo')
router.register(r'rotas', RotaViewSet, basename='rota')

urlpatterns = router.urls
