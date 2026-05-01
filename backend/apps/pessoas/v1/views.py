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
    queryset = Pessoa.objects.all()
    permission_classes = [IsAuthenticated, CadastrosPermission]

    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]

    # Filtros exatos
    filterset_fields = ['ativo', 'id', 'cpf']

    # Busca Textual
    search_fields = ['nome', 'cpf']

    # Ordenação
    ordering_fields = ['nome', 'cpf', 'id', 'ativo']
    ordering = ['-ativo', 'nome']

    def get_serializer_class(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return PessoaReadSerializer
        return PessoaWriteSerializer

    @action(detail=False, methods=['get'], serializer_class=PessoaLookupSerializer)
    def lookup(self, request):
        queryset = self.get_queryset()
        
        if 'ativo' not in request.query_params:
            queryset = queryset.filter(ativo=True)
        
        # Otimização: Traz apenas o necessário. 
        queryset = queryset.only('id', 'nome', 'cpf')
        
        serializer = self.get_serializer_class(queryset, many=True)
        return Response(serializer.data)
