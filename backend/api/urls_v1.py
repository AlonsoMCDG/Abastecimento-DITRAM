from django.urls import path, include

app_name = 'v1'

urlpatterns = [
    path('frota/', include('apps.frota.v1.urls')),
    path('operacao/', include('apps.operacao.v1.urls')),
    path('organizacao/', include('apps.organizacao.v1.urls')),
    path('pessoas/', include('apps.pessoas.v1.urls')),
    
    path('usuarios/', include('apps.usuarios.urls')),
]