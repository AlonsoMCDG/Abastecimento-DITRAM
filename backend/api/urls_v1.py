from django.urls import path, include

app_name = 'v1' # Define o namespace da v1 uma única vez

urlpatterns = [
    # Aqui não repete o namespace
    path('', include('apps.novo.frota.v1.urls')),
    path('', include('apps.novo.operacao.v1.urls')),
    path('', include('apps.novo.organizacao.v1.urls')),
    path('', include('apps.novo.pessoas.v1.urls')),
]