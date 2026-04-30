from django.http import HttpResponse
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import GuiaAbastecimentoPermission, FrotaPermission, CadastrosPermission

from apps.operacao.models import (
    TipoAtividade, AlocacaoServico, OperadorVeiculo, 
    GuiaAbastecimento, RegistroHodometroDiario
)
from .serializers import (
    TipoAtividadeSerializer, TipoAtividadeLookupSerializer,
    AlocacaoServicoReadSerializer, AlocacaoServicoWriteSerializer, AlocacaoServicoLookupSerializer,
    OperadorVeiculoReadSerializer, OperadorVeiculoWriteSerializer, OperadorVeiculoLookupSerializer,
    GuiaReadSerializer, GuiaWriteSerializer,
    RegistroHodometroDiarioSerializer
)

from apps.operacao.services.pdf_generator import gerar_pdf_guia


class TipoAtividadeViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoAtividade.objects.all()
    serializer_class = TipoAtividadeSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id', 'ativo']
    search_fields = ['nome']
    ordering_fields = ['nome', 'ativo']
    ordering = ['-ativo', 'nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return TipoAtividadeSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=['get'], serializer_class=TipoAtividadeLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
            
        queryset = queryset.only('id', 'nome')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AlocacaoServicoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = AlocacaoServico.objects.select_related('pessoa', 'tipo_atividade', 'secretaria').all()
    permission_classes = [IsAuthenticated, CadastrosPermission] 

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pessoa_id', 'tipo_atividade_id', 'secretaria_id', 'is_principal']
    
    search_fields = ['pessoa__nome', 'pessoa__cpf', 'tipo_atividade__nome', 'secretaria__sigla']
    ordering_fields = ['id', 'pessoa__nome', 'tipo_atividade__nome', 'secretaria__sigla', 'is_principal']
    ordering = ['-is_principal', 'pessoa__nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return AlocacaoServicoReadSerializer
        return AlocacaoServicoWriteSerializer

    @action(detail=False, methods=['get'], serializer_class=AlocacaoServicoLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        queryset = queryset.select_related(None).select_related('pessoa', 'tipo_atividade').only(
            'id', 'pessoa__nome', 'tipo_atividade__nome', 'secretaria_id', 'is_principal'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class OperadorVeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = OperadorVeiculo.objects.select_related('pessoa', 'veiculo').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pessoa_id', 'veiculo_id', 'is_principal']
    
    search_fields = ['pessoa__nome', 'pessoa__cpf', 'veiculo__placa', 'veiculo__modelo']
    ordering_fields = ['id', 'pessoa__nome', 'veiculo__placa', 'is_principal']
    ordering = ['-is_principal', 'pessoa__nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return OperadorVeiculoReadSerializer
        return OperadorVeiculoWriteSerializer

    @action(detail=False, methods=['get'], serializer_class=OperadorVeiculoLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.select_related(None).select_related('pessoa').only('id', 'pessoa__nome', 'is_principal')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class GuiaAbastecimentoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = GuiaAbastecimento.objects.select_related(
        'pessoa', 'veiculo', 'secretaria', 'rota', 'tipo_atividade',
        'instituicao', 'tipo_combustivel', 'usuario'
    ).all()

    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = [
        'modalidade', 'pessoa', 'veiculo', 'tipo_veiculo', 'secretaria', 'rota', 
        'tipo_atividade', 'instituicao', 'tipo_combustivel', 'usuario'
    ]

    search_fields = [
        'veiculo__placa', 'veiculo_descricao', 'pessoa__nome', 'pessoa__cpf', 
        'secretaria__sigla', 'instituicao__nome', 'tipo_atividade__nome',
        'identificacao_avulsa'
    ]

    ordering_fields = ['data_hora', 'id', 'tipo_atividade__nome', 'secretaria__nome', 'pessoa__nome', 'quantidade_combustivel']
    ordering = ['-data_hora']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return GuiaReadSerializer
        return GuiaWriteSerializer

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        try:
            pdf_bytes = gerar_pdf_guia(pk)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="guia_abastecimento_{pk}.pdf"'
            return response
        except ValueError:
            return Response({"detail": "Guia não encontrada no banco de dados."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Erro Crítico no PDF: {e}") 
            return Response({"detail": "Erro interno ao gerar o layout do PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistroHodometroDiarioViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = RegistroHodometroDiario.objects.all()
    serializer_class = RegistroHodometroDiarioSerializer
    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['guia_id', 'data_referencia']
    ordering_fields = ['data_referencia']
    ordering = ['data_referencia']
