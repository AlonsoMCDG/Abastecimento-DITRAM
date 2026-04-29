from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import FrotaPermission

from apps.frota.models import Veiculo, Rota, TipoCombustivel
from .serializers import (
    VeiculoWriteSerializer, VeiculoReadSerializer, VeiculoLookupSerializer,
    RotaWriteSerializer, RotaReadSerializer, RotaLookupSerializer,
    TipoCombustivelSerializer, TipoCombustivelLookupSerializer
)

class VeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Veiculo.objects.all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Filtro Exato
    filterset_fields = ['id', 'categoria', 'ativo']

    # Busca Textual
    search_fields = ['placa', 'modelo']

    # Ordenação
    ordering_fields = ['id', 'placa', 'modelo', 'hodometro_atual', 'ativo']
    ordering = ['-ativo', 'modelo'] # Primeiro os ativos, ordem alfabética

    def get_queryset(self):
        queryset = super().get_queryset()
        pessoa_id = self.request.query_params.get('pessoa_id')

        if pessoa_id:
            # Filtra veículos associados ao motorista (Acessa a relação inversa de OperadorVeiculo do módulo operacao)
            queryset = queryset.filter(operadores__pessoa_id=pessoa_id).distinct()

        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return VeiculoReadSerializer
        return VeiculoWriteSerializer
    
    @action(detail=False, methods=['get'], serializer_class=VeiculoLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        queryset = queryset.only('id', 'modelo', 'placa', 'categoria')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RotaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Rota.objects.select_related('secretaria').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ['id', 'secretaria_id', 'ativa']
    
    search_fields = ['nome', 'detalhes', 'secretaria__nome', 'secretaria__sigla']

    ordering_fields = ['id', 'nome', 'distancia_km', 'secretaria__nome', 'secretaria__sigla', 'ativa']
    ordering = ['-ativa', 'nome'] 

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return RotaReadSerializer
        return RotaWriteSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        if 'ativa' not in request.query_params:
            queryset = queryset.filter(ativa=True)
            
        # OTIMIZAÇÃO: Limpa o select_related vindo da classe
        queryset = queryset.select_related(None).only('id', 'nome', 'distancia_km', 'secretaria_id')

        serializer = RotaLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class TipoCombustivelViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoCombustivel.objects.all()
    serializer_class = TipoCombustivelSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id', 'ativo']
    search_fields = ['nome']
    ordering_fields = ['nome']
    ordering = ['nome'] 
    
    @action(detail=False, methods=['get'], serializer_class=TipoCombustivelLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
            
        queryset = queryset.only('id', 'nome')

        serializer = self.get_serializer_class(queryset, many=True)
        return Response(serializer.data)
