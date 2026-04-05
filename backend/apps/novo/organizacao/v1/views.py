from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.usuarios.permissions import CadastrosPermission
from apps.core.viewset_cache import ModelViewSetCacheMixin
from django_filters.rest_framework import DjangoFilterBackend

from .models import Secretaria, Instituicao
from .serializers import (
    SecretariaSerializer, SecretariaLookupSerializer,
    InstituicaoWriteSerializer, InstituicaoReadSerializer, InstituicaoLookupSerializer
)


class SecretariaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Secretaria.objects.all()
    serializer_class = SecretariaSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]

    # Habilitando os motores (Filtro Exato, Busca Textual, Ordenação)
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Configuração do Busca Textual (?search=SME ou ?search=Saúde)
    search_fields = ['nome', 'sigla']

    # Configuração do Filtro Exato (?sigla=SME)
    filterset_fields = ['id', 'sigla']

    # Configuração de Ordenação (?ordering=-id)
    ordering_fields = ['nome', 'sigla']
    ordering = ['nome'] # Ordenação padrão alfabética
    
    # endpoint customizado: /api/secretaria/lookup/
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        # Usamos o .only() para otimizar a query no banco, já que o lookup precisa de poucos campos
        queryset = self.get_queryset().only('nome', 'sigla')

        # Usa o serializer leve para o Select
        serializer = SecretariaLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class InstituicaoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Instituicao.objects.all().select_related('secretaria').all()
    permission_classes = [IsAuthenticated, CadastrosPermission]

    # Habilitando os motores (Filtro Exato, Busca Textual, Ordenação)
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Configuração de Filtros Exatos (?secretaria_id=1&tipo_locomocao=TERRESTRE)
    filterset_fields = ['id', 'secretaria_id', 'tipo']

    # Configuração de Busca Textual (?search=hilux)
    search_fields = ['nome', 'tipo', 'secretaria__nome']
    
    # Configuração de Ordenação (?ordering=-id)
    ordering_fields = ['nome', 'tipo', 'id', 'secretaria__nome']
    ordering = ['nome'] # Ordenação padrão alfabética

    def get_serializer_class(self):
        # CRUD Padrão: GET usa Read, POST/PUT/PATCH usa Write
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return InstituicaoReadSerializer
        return InstituicaoWriteSerializer
    
    # endpoint customizado: /api/instituicao/lookup/
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        # Usa self.filter_queryset para que o lookup também obedeça 
        # aos filtros! Assim o frontend pode fazer: /lookup/?secretaria_id=1
        queryset = self.filter_queryset(self.get_queryset())

        # Otimiza a query trazendo apenas o necessário para o Select
        queryset = queryset.only('id', 'nome')

        # Usamos o serializer leve e com dados embutidos para o Select
        serializer = InstituicaoLookupSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        secretaria = self.request.query_params.get("secretaria")
        if secretaria:
            queryset = queryset.filter(secretaria_id=secretaria)
        return queryset
