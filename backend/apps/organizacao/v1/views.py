from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.usuarios.permissions import CadastrosPermission
from apps.core.viewset_cache import ModelViewSetCacheMixin
from django_filters.rest_framework import DjangoFilterBackend

from apps.organizacao.models import Secretaria, Instituicao
from .serializers import (
    SecretariaSerializer, SecretariaLookupSerializer,
    InstituicaoWriteSerializer, InstituicaoReadSerializer, InstituicaoLookupSerializer
)


class SecretariaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Secretaria.objects.all().order_by('-ativo', 'nome')
    serializer_class = SecretariaSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtro Exato
    filterset_fields = ['id', 'sigla', 'ativo']

    # Busca Textual
    search_fields = ['nome', 'sigla']

    # Ordenação (Ativos no topo, alfabético depois)
    ordering_fields = ['nome', 'sigla', 'ativo']
    ordering = ['-ativo', 'nome'] 
    
    @action(detail=False, methods=['get'], serializer_class=SecretariaLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Só exibe secretarias ativas nos Selects do sistema
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        # Otimização da query
        queryset = queryset.only('id', 'nome', 'sigla')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class InstituicaoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Instituicao.objects.select_related('secretaria').all()
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros Exatos
    filterset_fields = ['id', 'secretaria', 'tipo', 'ativo']

    # Busca Textual
    search_fields = ['nome', 'secretaria__nome', 'secretaria__sigla']
    
    # Ordenação
    ordering_fields = ['nome', 'tipo', 'id', 'secretaria__sigla', 'ativo']
    ordering = ['-ativo', 'nome'] # Ativas no topo, depois alfabético

    def get_serializer_class(self):
        if self.action == 'lookup':
            return InstituicaoLookupSerializer
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return InstituicaoReadSerializer
        return InstituicaoWriteSerializer
    
    @action(detail=False, methods=['get'], serializer_class=InstituicaoLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        # Só exibe instituições ativas nos Selects
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        # Otimiza a query
        queryset = queryset.only('id', 'nome', 'tipo', 'secretaria_id')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
