from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import FrotaPermission

from apps.frota.models import Veiculo, Rota, TipoCombustivel, TipoVeiculo
from .serializers import (
    VeiculoWriteSerializer, VeiculoReadSerializer, VeiculoLookupSerializer,
    RotaWriteSerializer, RotaReadSerializer, RotaLookupSerializer,
    TipoCombustivelSerializer, TipoCombustivelLookupSerializer,
    TipoVeiculoSerializer, TipoVeiculoLookupSerializer
)

class VeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Veiculo.objects.select_related(
        'secretaria', 
        'tipo_combustivel', 
        'tipo_veiculo'
    ).all()
    
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Filtros Exatos: Corrigido para as chaves estrangeiras com _id
    filterset_fields = [
        'id', 'secretaria_id', 'tipo_locomocao', 
        'tipo_combustivel_id', 'tipo_veiculo_id', 'ativo'
    ]

    # Busca Textual: Busca robusta cruzando as tabelas
    search_fields = [
        'placa', 'modelo', 
        'secretaria__nome', 'secretaria__sigla',
        'tipo_combustivel__nome', 
        'tipo_veiculo__nome'
    ]

    # Ordenação
    ordering_fields = [
        'id', 'placa', 'modelo', 'hodometro_atual',
        'secretaria__nome', 'secretaria__sigla', 
        'tipo_veiculo__nome', 'ativo'
    ]
    ordering = ['-ativo', 'modelo'] # Primeiro os ativos, ordem alfabética

    def get_queryset(self):
        queryset = super().get_queryset()
        pessoa_id = self.request.query_params.get('pessoa_id')

        if pessoa_id:
            # Filtra veículos associados ao motorista
            queryset = queryset.filter(operadores__pessoa_id=pessoa_id)

        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return VeiculoReadSerializer
        return VeiculoWriteSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        # Otimização do Lookup: Mantém o join com tipo_combustivel pois a label usa ele
        queryset = queryset.select_related('tipo_combustivel').only(
            'id', 'modelo', 'placa', 'ativo',
            'consumo_estimado_combustivel', 'unidade_consumo', 
            'tipo_combustivel_id', 'tipo_combustivel__nome',
            'secretaria_id', 'tipo_veiculo_id'
        )

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
    search_fields = [
        'nome', 
        'detalhes',
        'tipo_locomocao',
        'secretaria__nome', 
        'secretaria__sigla',
        'instituicao__nome', 
    ]

    # Ordenação
    ordering_fields = [
        'id', 'nome', 'distancia_km', 
        'secretaria__nome', 'secretaria__sigla',
        'instituicao__nome', 'tipo_locomocao', 
        'ativa'
    ]
    
    ordering = ['-ativa', 'nome'] 

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return RotaReadSerializer
        return RotaWriteSerializer
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # OTIMIZAÇÃO AQUI: 
        # Limpa o select_related('secretaria', 'instituicao') vindo da classe
        queryset = queryset.select_related(None).only(
            'id', 'nome', 'distancia_km', 'tipo_locomocao', 'detalhes', 
            'secretaria_id', 'instituicao_id'
        )

        serializer = RotaLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class TipoCombustivelViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoCombustivel.objects.all()
    serializer_class = TipoCombustivelSerializer
    permission_classes = [IsAuthenticated]

    # Habilitando os motores (Filtro Exato, Busca Textual, Ordenação)
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Configuração do Busca Textual (?search=SME ou ?search=Saúde)
    search_fields = ['nome']

    # Configuração do Filtro Exato (?sigla=SME)
    filterset_fields = ['id']

    # Configuração de Ordenação (?ordering=-id)
    ordering_fields = ['nome']
    ordering = ['nome'] # Ordenação padrão alfabética
    
    # endpoint customizado: /api/secretaria/lookup/
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        # Usamos o .only() para otimizar a query no banco, já que o lookup precisa de poucos campos
        queryset = self.get_queryset().only('nome')

        # Usa o serializer leve para o Select
        serializer = TipoCombustivelLookupSerializer(queryset, many=True)
        return Response(serializer.data)



class TipoVeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoVeiculo.objects.all()
    serializer_class = TipoVeiculoSerializer
    permission_classes = [IsAuthenticated]

    # Habilitando os motores (Filtro Exato, Busca Textual, Ordenação)
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Configuração do Busca Textual (?search=SME ou ?search=Saúde)
    search_fields = ['nome']

    # Configuração do Filtro Exato (?sigla=SME)
    filterset_fields = ['id']

    # Configuração de Ordenação (?ordering=-id)
    ordering_fields = ['nome']
    ordering = ['nome'] # Ordenação padrão alfabética
    
    # endpoint customizado: /api/secretaria/lookup/
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        # Usamos o .only() para otimizar a query no banco, já que o lookup precisa de poucos campos
        queryset = self.get_queryset().only('nome')

        # Usa o serializer leve para o Select
        serializer = TipoVeiculoLookupSerializer(queryset, many=True)
        return Response(serializer.data)
