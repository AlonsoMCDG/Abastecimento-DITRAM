from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.viewset_cache import ModelViewSetCacheMixin
from apps.usuarios.permissions import CadastrosPermission

from .models import Pessoa
from .serializers import PessoaSerializer, PessoaLookupSerializer


class PessoaViewSet(ModelViewSetCacheMixin, viewsets.ModelViewSet):
    queryset = Pessoa.objects.all()
    serializer_class = PessoaSerializer
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
    ordering_fields = ['nome', 'cpf', 'id']
    ordering = ['nome']

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Otimização: Traz apenas os campos usados pelo PessoaLookupSerializer
        queryset = queryset.only('id', 'nome', 'cpf')
        
        serializer = PessoaLookupSerializer(queryset, many=True)
        return Response(serializer.data)
