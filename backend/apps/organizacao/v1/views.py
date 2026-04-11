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
    queryset = Secretaria.objects.all()
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
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # REGRA DE NEGÓCIO: Só exibe secretarias ativas nos Selects do sistema
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        # Otimização da query
        queryset = queryset.only('nome', 'sigla')

        serializer = SecretariaLookupSerializer(queryset, many=True)
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
    filterset_fields = ['id', 'secretaria_id', 'tipo', 'ativo']

    # Busca Textual
    search_fields = ['nome', 'tipo', 'secretaria__nome', 'secretaria__sigla']
    
    # Ordenação
    ordering_fields = ['nome', 'tipo', 'id', 'secretaria__sigla', 'ativo']
    ordering = ['-ativo', 'nome'] # Ativas no topo, depois alfabético

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return InstituicaoReadSerializer
        return InstituicaoWriteSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        # Só exibe instituições ativas nos Selects
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        # Otimiza a query. Precisamos do tipo e nome para o get_label
        queryset = queryset.only('id', 'nome', 'tipo', 'secretaria_id')

        serializer = InstituicaoLookupSerializer(queryset, many=True)
        return Response(serializer.data)
