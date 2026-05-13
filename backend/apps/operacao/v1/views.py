from django.http import HttpResponse
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError

from apps.pessoas.models import Pessoa
from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import GuiaAbastecimentoPermission, CadastrosPermission

from apps.operacao.models import TipoAtividade, GuiaAbastecimento, RegistroHodometroDiario
from .serializers import (
    TipoAtividadeSerializer, TipoAtividadeLookupSerializer,
    GuiaReadSerializer, GuiaWriteSerializer, RegistroHodometroDiarioSerializer
)

# Services
from apps.operacao.services import guia_service
from apps.operacao.services import hodometro_service
from apps.operacao.services.pdf_service import gerar_pdf_guia
from apps.operacao.services.sugestoes_service import get_sugestoes_pessoa


class TipoAtividadeViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = TipoAtividade.objects.all()
    serializer_class = TipoAtividadeSerializer
    permission_classes = [IsAuthenticated, CadastrosPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ativo']
    search_fields = ['nome']
    ordering = ['-ativo', 'nome']

    @action(detail=False, methods=['get'], serializer_class=TipoAtividadeLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
        serializer = self.get_serializer(queryset.only('id', 'nome'), many=True)
        return Response(serializer.data)


class GuiaAbastecimentoViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = GuiaAbastecimento.objects.select_related(
        'pessoa', 'veiculo', 'secretaria', 'rota', 'tipo_atividade',
        'instituicao', 'tipo_combustivel', 'usuario'
    ).all()
    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['modalidade', 'pessoa', 'veiculo', 'secretaria']
    search_fields = ['veiculo__placa', 'veiculo_descricao', 'pessoa__nome']
    ordering = ['-data_hora']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return GuiaReadSerializer
        return GuiaWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            guia = guia_service.criar_guia(serializer.validated_data, request.user)
            read_serializer = GuiaReadSerializer(guia)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(e.message_dict if hasattr(e, 'message_dict') else {'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            guia = guia_service.atualizar_guia(instance, serializer.validated_data)
            return Response(GuiaReadSerializer(guia).data)
        except ValidationError as e:
            return Response(e.message_dict if hasattr(e, 'message_dict') else {'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        try:
            guia = self.get_object()
            pdf_bytes = gerar_pdf_guia(guia)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="guia_abastecimento_{pk}.pdf"'
            return response
        except Exception:
            return Response({"detail": "Erro interno ao gerar o PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def sugestoes(self, request):
        pessoa_id = request.query_params.get("pessoa")
        if not pessoa_id:
            return Response({"detail": "Parâmetro 'pessoa' é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        
        dados = get_sugestoes_pessoa(pessoa_id)
        return Response(dados, status=status.HTTP_200_OK)


class RegistroHodometroDiarioViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = RegistroHodometroDiario.objects.all()
    serializer_class = RegistroHodometroDiarioSerializer
    permission_classes = [IsAuthenticated, GuiaAbastecimentoPermission]
    filterset_fields = ['guia', 'data_referencia']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            registro = hodometro_service.registrar_hodometro_diario(serializer.validated_data)
            return Response(self.get_serializer(registro).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(e.message_dict if hasattr(e, 'message_dict') else {'detail': e.messages}, status=status.HTTP_400_BAD_REQUEST)
