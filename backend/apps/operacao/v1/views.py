from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import GuiaAbastecimentoPermission, FrotaPermission, CadastrosPermission

from apps.operacao.models import OperadorVeiculo, Guia, TipoServico, AlocacaoServico
from .serializers import (
    TipoServicoSerializer, TipoServicoLookupSerializer,
    AlocacaoServicoReadSerializer, AlocacaoServicoWriteSerializer,
    OperadorVeiculoReadSerializer, OperadorVeiculoWriteSerializer,
    GuiaReadSerializer, GuiaWriteSerializer
)


class TipoServicoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoServico.objects.all()
    serializer_class = TipoServicoSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]

    # Habilitando os motores
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Busca Textual
    search_fields = ['nome', 'id']

    # Ordenação
    ordering_fields = ['nome', 'id']
    ordering = ['nome']

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Otimização: Traz apenas o necessário para o Select do frontend
        queryset = queryset.only('id', 'nome')
        
        serializer = TipoServicoLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class AlocacaoServicoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = AlocacaoServico.objects.select_related('pessoa', 'tipo_servico').all()
    # Adicione permissões
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pessoa_id', 'tipo_servico_id', 'is_principal']
    
    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return AlocacaoServicoReadSerializer
        return AlocacaoServicoWriteSerializer


class OperadorVeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # Performance: Otimiza as duas FKs
    queryset = OperadorVeiculo.objects.select_related('pessoa', 'veiculo').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    
    # Permite filtrar rapidamente quais veículos pertencem a um motorista ou vice-versa
    filterset_fields = ['pessoa_id', 'veiculo_id', 'is_principal']
    
    ordering_fields = ['id']
    ordering = ['-id']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return OperadorVeiculoReadSerializer
        return OperadorVeiculoWriteSerializer


class GuiaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # PERFORMANCE CRÍTICA: Faz o JOIN nas 5 tabelas de uma só vez
    queryset = Guia.objects.select_related(
        'pessoa', 'veiculo', 'secretaria', 'rota', 'tipo_servico'
    ).all()

    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros exatos: Perfeito para relatórios (ex: "Todas as guias da SEME no veículo X")
    filterset_fields = [
        'pessoa_id', 'veiculo_id', 'secretaria_id', 'rota_id', 'tipo_servico_id'
    ]

    # Busca Textual cruzando para as outras tabelas
    search_fields = [
        'veiculo__placa', 
        'pessoa__nome', 
        'pessoa__cpf', 
        'secretaria__sigla'
    ]

    ordering_fields = ['data_hora', 'id', 'hodometro_atual']
    ordering = ['-data_hora']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return GuiaReadSerializer
        return GuiaWriteSerializer
