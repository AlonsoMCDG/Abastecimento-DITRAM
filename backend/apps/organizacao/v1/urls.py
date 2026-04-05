from rest_framework.routers import DefaultRouter
from .views import SecretariaViewSet, InstituicaoViewSet

router = DefaultRouter()
router.register(r'secretarias', SecretariaViewSet, basename='secretaria')
router.register(r'instituicoes', InstituicaoViewSet, basename='instituicao')

urlpatterns = router.urls