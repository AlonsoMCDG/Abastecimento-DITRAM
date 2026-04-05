from rest_framework.routers import DefaultRouter
from .views import PessoaViewSet

router = DefaultRouter()

router.register(r'base', PessoaViewSet, basename='pessoa')

urlpatterns = router.urls
