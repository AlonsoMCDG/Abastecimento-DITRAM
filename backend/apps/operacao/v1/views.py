from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.pessoas.models import Pessoa
from apps.operacao.services.sugestoes import get_sugestoes_pessoa


from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import (
    GuiaAbastecimentoPermission,
    CadastrosPermission
)

from apps.operacao.models import (
    TipoAtividade,
    GuiaAbastecimento,
    RegistroHodometroDiario
)

from .serializers import (
    TipoAtividadeSerializer,
    TipoAtividadeLookupSerializer,
    GuiaReadSerializer,
    GuiaWriteSerializer,
    RegistroHodometroDiarioSerializer
)

from apps.operacao.services.pdf_generator import gerar_pdf_guia

# =========================================================
# TIPO ATIVIDADE
# =========================================================
class TipoAtividadeViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoAtividade.objects.all()
    serializer_class = TipoAtividadeSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome']
    ordering_fields = ['nome', 'ativo']
    ordering = ['-ativo', 'nome']

    @action(detail=False, methods=['get'], serializer_class=TipoAtividadeLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)

        queryset = queryset.only('id', 'nome')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# =========================================================
# GUIA ABASTECIMENTO (CORE DO SISTEMA)
# =========================================================
class GuiaAbastecimentoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = GuiaAbastecimento.objects.select_related(
        'pessoa',
        'veiculo',
        'secretaria',
        'rota',
        'tipo_atividade',
        'instituicao',
        'tipo_combustivel',
        'usuario'
    ).all()

    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = [
        'modalidade',
        'pessoa',
        'veiculo',
        'tipo_veiculo',
        'secretaria',
        'rota',
        'tipo_atividade',
        'instituicao',
        'tipo_combustivel',
        'usuario'
    ]

    search_fields = [
        'veiculo__placa',
        'veiculo_descricao',
        'pessoa__nome',
        'pessoa__cpf',
        'secretaria__sigla',
        'instituicao__nome',
        'tipo_atividade__nome'
    ]

    ordering_fields = [
        'data_hora',
        'id',
        'tipo_atividade__nome',
        'secretaria__nome',
        'pessoa__nome',
        'quantidade_combustivel'
    ]

    ordering = ['-data_hora']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return GuiaReadSerializer
        return GuiaWriteSerializer

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # -----------------------------------------------------
    # PDF
    # -----------------------------------------------------
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        try:
            guia = self.get_object()
            pdf_bytes = gerar_pdf_guia(guia)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = (
                f'inline; filename="guia_abastecimento_{pk}.pdf"'
            )
            return response

        except ValueError:
            return Response(
                {"detail": "Guia não encontrada no banco de dados."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            print(f"Erro Crítico no PDF: {e}")
            return Response(
                {"detail": "Erro interno ao gerar o PDF."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # -----------------------------------------------------
    # Sugestões inteligentes
    # -----------------------------------------------------
    @action(detail=False, methods=["get"])
    def sugestoes(self, request):
        pessoa_id = request.query_params.get("pessoa")

        if not pessoa_id:
            return Response(
                {"detail": "Parâmetro 'pessoa' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pessoa = get_object_or_404(Pessoa, id=pessoa_id)


# =========================================================
# HODÔMETRO
# =========================================================
class RegistroHodometroDiarioViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = RegistroHodometroDiario.objects.all()
    serializer_class = RegistroHodometroDiarioSerializer
    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['guia', 'data_referencia']
    ordering_fields = ['data_referencia']
    ordering = ['data_referencia']
