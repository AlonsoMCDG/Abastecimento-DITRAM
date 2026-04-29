from django.http import HttpResponse
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import GuiaAbastecimentoPermission, FrotaPermission, CadastrosPermission

from apps.operacao.models import OperadorVeiculo, Guia, TipoServico, AlocacaoServico
from .serializers import (
    TipoServicoSerializer, TipoServicoLookupSerializer,
    AlocacaoServicoReadSerializer, AlocacaoServicoWriteSerializer, AlocacaoServicoLookupSerializer,
    OperadorVeiculoReadSerializer, OperadorVeiculoWriteSerializer,
    GuiaReadSerializer, GuiaWriteSerializer
)

from apps.operacao.services.pdf_generator import gerar_pdf_guia

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

    # Filtros Exatos
    filterset_fields = ['id', 'ativo']

    # Busca Textual
    search_fields = ['nome', 'id']

    # Ordenação (Ativos primeiro, depois ordem alfabética)
    ordering_fields = ['nome', 'id', 'ativo']
    ordering = ['-ativo', 'nome']

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # REGRA DE NEGÓCIO: Só exibe serviços ativos nos Selects (Dropdowns)
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
        
        # Otimização: Traz apenas o necessário para o Select do frontend
        queryset = queryset.only('id', 'nome')
        
        serializer = TipoServicoLookupSerializer(queryset, many=True)
        return Response(serializer.data)


class AlocacaoServicoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # PREVENÇÃO N+1: Busca as 3 tabelas em uma única ida ao banco
    queryset = AlocacaoServico.objects.select_related('pessoa', 'tipo_servico', 'secretaria').all()
    
    # SEGURANÇA
    permission_classes = [IsAuthenticated, CadastrosPermission] 

    # MOTORES HABILITADOS
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros Exatos 
    filterset_fields = ['pessoa_id', 'tipo_servico_id', 'secretaria_id', 'is_principal']
    
    # Busca Textual (Permite o usuário pesquisar pelo nome na tabela)
    search_fields = [
        'pessoa__nome', 
        'pessoa__cpf', 
        'tipo_servico__nome', 
        'secretaria__sigla'
    ]

    # Ordenação
    ordering_fields = ['id', 'pessoa__nome', 'tipo_servico__nome', 'secretaria__sigla', 'is_principal']
    ordering = ['-is_principal', 'pessoa__nome'] # Traz os principais primeiro

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return AlocacaoServicoReadSerializer
        return AlocacaoServicoWriteSerializer

    @action(detail=False, methods=['get'], serializer_class=AlocacaoServicoLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # OTIMIZAÇÃO LOOKUP
        queryset = queryset.select_related(None).select_related('pessoa', 'tipo_servico').only(
            'id', 
            'pessoa__nome',
            'tipo_servico__nome',
            'secretaria_id', 
            'is_principal'
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class OperadorVeiculoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # Performance: Otimiza as duas FKs para evitar N+1 queries
    queryset = OperadorVeiculo.objects.select_related('pessoa', 'veiculo').all()
    permission_classes = [IsAuthenticated, FrotaPermission]

    # Habilitando motores
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, # Faltava este!
        filters.OrderingFilter
    ]
    
    # Filtros exatos
    filterset_fields = ['pessoa_id', 'veiculo_id', 'is_principal']
    
    # Busca Textual Inteligente
    search_fields = [
        'pessoa__nome', 
        'pessoa__cpf', 
        'veiculo__placa', 
        'veiculo__modelo'
    ]
    
    # Ordenação (Motoristas principais ficam no topo por padrão)
    ordering_fields = ['id', 'pessoa__nome', 'veiculo__placa', 'is_principal']
    ordering = ['-is_principal', 'pessoa__nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return OperadorVeiculoReadSerializer
        return OperadorVeiculoWriteSerializer


class GuiaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # ==========================================
    # Faz o INNER JOIN entre as tabelas para prevenção de N+1 Queries
    # ==========================================
    queryset = Guia.objects.select_related(
        'pessoa', 'veiculo', 'secretaria', 'rota', 'tipo_servico',
        'instituicao', 'tipo_veiculo', 'tipo_combustivel', 'usuario'
    ).all()

    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros exatos atualizados com as novas FKs (Excelentes para relatórios)
    filterset_fields = [
        'pessoa_id', 'veiculo_id', 'secretaria_id', 'rota_id', 
        'tipo_servico_id', 'instituicao_id', 'tipo_veiculo_id', 
        'tipo_combustivel_id', 'usuario_id'
    ]

    # Busca Textual cruzando para as outras tabelas
    search_fields = [
        'veiculo__placa', 
        'pessoa__nome', 
        'pessoa__cpf', 
        'secretaria__sigla',
        'instituicao__nome',
        'tipo_servico__nome',
        'tipo_servico_texto',
    ]

    ordering_fields = ['data_hora', 'id', 'tipo_servico__nome', 'secretaria__nome', 'pessoa__nome', 'quantidade_combustivel']
    ordering = ['-data_hora']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return GuiaReadSerializer
        return GuiaWriteSerializer

    # ==========================================
    # INJEÇÃO DE AUTORIA (Segurança)
    # ==========================================
    def perform_create(self, serializer):
        # O frontend não envia o usuario_id. O backend extrai do token JWT.
        serializer.save(usuario=self.request.user)
    
    # ==========================================
    # GERAÇÃO DE PDF
    # Rota gerada: GET /api/v1/guias/<pk>/pdf/
    # ==========================================
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        try:
            # Chama o motor do ReportLab para desenhar o PDF
            pdf_bytes = gerar_pdf_guia(pk)
            
            # Devolve como arquivo binário
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            
            # Usando "inline" para abrir na aba do navegador/iframe
            response['Content-Disposition'] = f'inline; filename="guia_abastecimento_{pk}.pdf"'
            
            return response
            
        except ValueError:
            return Response(
                {"detail": "Guia não encontrada no banco de dados."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            # Em desenvolvimento, é útil imprimir o erro real no console do Django
            print(f"Erro Crítico no PDF: {e}") 
            return Response(
                {"detail": "Erro interno ao gerar o layout do PDF."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
