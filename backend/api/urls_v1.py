from django.urls import path, include

from apps.common.viewsets import choices

app_name = 'v1'

urlpatterns = [
    # FONTE ÚNICA DE VERDADE DOS ENUMS (choices dos models do backend):
    #   GET /api/v1/choices/                    -> todos os grupos
    #   GET /api/v1/choices/veiculo/categoria/  -> um enum específico
    path('choices/', choices, name='choices'),
    path('choices/<str:grupo>/<str:campo>/', choices, name='choices-detail'),

    path('frota/', include('apps.frota.v1.urls')),
    path('operacao/', include('apps.operacao.v1.urls')),
    path('organizacao/', include('apps.organizacao.v1.urls')),
    path('pessoas/', include('apps.pessoas.v1.urls')),

    path('usuarios/', include('apps.usuarios.urls')),
]