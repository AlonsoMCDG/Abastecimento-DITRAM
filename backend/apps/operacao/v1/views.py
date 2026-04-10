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

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # 1. select_related(None): Anula o 'tipo_servico' e 'pessoa' vindos do topo da classe.
        # 2. select_related('pessoa'): Refaz o JOIN só com quem a gente precisa agora.
        # 3. only(...): Filtra as colunas.
        queryset = queryset.select_related(None).select_related('pessoa').only(
            'id', 
            'pessoa__nome',
            'secretaria_id', 
            'is_principal'
        )
        
        serializer = AlocacaoServicoLookupSerializer(queryset, many=True)
        return Response(serializer.data)


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
