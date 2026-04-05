from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import FrotaPermission

from .models import Veiculo, Rota
from .serializers import (
    VeiculoWriteSerializer, VeiculoReadSerializer, VeiculoLookupSerializer,
    RotaWriteSerializer, RotaReadSerializer, RotaLookupSerializer
)

class VeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # Performance: select_related para buscar a secretaria em uma única query
    queryset = Veiculo.objects.select_related('secretaria').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    # Habilitando os motores (Filtro Exato, Busca Textual, Ordenação)
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros Exatos (?secretaria_id=1&tipo_locomocao=TERRESTRE)
    filterset_fields = ['id', 'secretaria_id', 'tipo_locomocao', 'tipo_combustivel']

    # Busca Textual (?search=hilux)
    search_fields = ['placa', 'modelo', 'secretaria__nome']

    # Ordenação
    ordering_fields = ['placa', 'modelo', 'id', 'secretaria__nome']
    ordering = ['id']
    
    def get_serializer_class(self):
        # Roteamento de DTOs: Read para visualização, Write para salvamento
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return VeiculoReadSerializer
        return VeiculoWriteSerializer
    
    # endpoint customizado: /api/veiculo/lookup/
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        # self.filter_queryset permite que o lookup obedeça aos parâmetros da URL (?secretaria_id=1)
        queryset = self.filter_queryset(self.get_queryset())

        # Otimização: Traz do banco apenas as colunas usadas pelo VeiculoLookupSerializer
        queryset = queryset.only(
            'id', 'modelo', 'placa', 'tipo_combustivel', 
            'consumo_estimado_combustivel', 'unidade_consumo', 
            'secretaria_id'
        )

        # Usamos o serializer leve e com dados embutidos para o Select
        serializer = VeiculoLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class RotaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # Performance: select_related duplo para as duas foreign keys da Rota
    queryset = Rota.objects.select_related('secretaria', 'instituicao').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros Exatos (?secretaria_id=3&instituicao_id=1)
    filterset_fields = ['id', 'secretaria_id', 'instituicao_id', 'tipo_locomocao', 'ativa']

    # Busca Textual: Busca no próprio nome e nos nomes das entidades relacionadas
    search_fields = ['nome', 'secretaria__nome', 'instituicao__nome']

    # Ordenação
    ordering_fields = ['nome', 'distancia_km', 'id']
    ordering = ['nome'] 

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return RotaReadSerializer
        return RotaWriteSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Otimização: Traz do banco apenas as colunas usadas pelo RotaLookupSerializer
        queryset = queryset.only(
            'id', 'nome', 'distancia_km', 'tipo_locomocao', 
            'secretaria_id', 'instituicao_id'
        )

        serializer = RotaLookupSerializer(queryset, many=True)
        return Response(serializer.data)
