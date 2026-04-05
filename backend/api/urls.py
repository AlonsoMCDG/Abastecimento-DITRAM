from django.contrib import admin
from django.urls import path, include
from .views import home, hello
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('hello/', hello),

    # ----------------------------------------------------
    # APIs LEGADAS (Antigas)
    # ----------------------------------------------------
    # Sem namespace. O DRF vai assumir a 'DEFAULT_VERSION': 'v1'
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/cadastros/', include('apps.cadastros.urls')),
    path('api/frota/', include('apps.frota.urls')),
    path('api/abastecimento/', include('apps.abastecimento.urls')),

    # ----------------------------------------------------
    # NOVAS APIs (Versionadas)
    # ----------------------------------------------------
    path('api/core/', include('apps.core.urls')),
    path('api/v1/', include('api.urls_v1', namespace='v1')),

    # Tokens de autenticação
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
