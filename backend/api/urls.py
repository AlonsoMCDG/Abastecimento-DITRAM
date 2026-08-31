from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Função simples para responder ao Render
def health_check(request):
    return JsonResponse({"status": "API online e operante", "servico": "Abastecimento"})

urlpatterns = [
    # Mapear a raiz para retornar 200 OK para o render
    path('', health_check),
    
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
    # NOTA: apps.usuarios.urls NÃO é mais montado em /api/usuarios/.
    # Já é montado em /api/v1/usuarios/ (via api.urls_v1) — a duplicação
    # expunha o mesmo UsuarioViewSet em dois caminhos.
]