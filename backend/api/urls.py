# projeto/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Autenticação (Global)
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # APIs Versionadas
    path('api/v1/', include('api.urls_v1', namespace='v1')),
    
    # Exemplo de v2 no futuro:
    # path('api/v2/', include('api.urls_v2', namespace='v2')),

    # Core/Legacy
    path('api/core/', include('apps.core.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')), 
]