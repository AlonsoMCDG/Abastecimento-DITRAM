from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import CadastrosPermission

from apps.pessoas.models import Pessoa
from .serializers import (
    PessoaWriteSerializer, 
    PessoaReadSerializer, 
    PessoaLookupSerializer
)

class PessoaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    # prefetch_related carrega todas as funções N:M de uma só vez, salvando o banco de dados
    queryset = Pessoa.objects.prefetch_related('funcoes').all()
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros exatos
    filterset_fields = ['ativo', 'id', 'cpf', 'funcoes', 'funcoes__nome']

    # Busca Textual
    search_fields = ['nome', 'cpf', 'funcoes__nome']

    # Ordenação
    ordering_fields = ['nome', 'cpf', 'id', 'ativo']
    ordering = ['-ativo', 'nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS'] and self.action != 'lookup':
            return PessoaReadSerializer
        return PessoaWriteSerializer

    def filter_queryset(self, queryset):
        # Garante que as buscas textuais e os filtros em campos N:M não dupliquem a pessoa na lista
        qs = super().filter_queryset(queryset)
        return qs.distinct()

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset()).prefetch_related('funcoes')
        
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
        
        # Otimização: Traz apenas o necessário. 
        queryset = queryset.only('id', 'nome', 'cpf')
        
        serializer = PessoaLookupSerializer(queryset, many=True)
        return Response(serializer.data)