from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.frota.models import Veiculo
from apps.operacao.models import GuiaAbastecimento
from apps.organizacao.models import Instituicao

# ============================================================
# FONTE ÚNICA DE VERDADE PARA OS ENUMS DO SISTEMA
#
# Todos os choices vivem nos models do backend. Este endpoint os
# expõe para o frontend popular dropdowns SEM copiar as listas,
# eliminando a classe de bugs "enum divergente entre front e back"
# (ex.: VEICULO_PESADO, CAMINHAO, BARQUEIRO no passado).
#
# GET /api/v1/choices/                      -> todos os grupos
# GET /api/v1/choices/veiculo/categoria/    -> um enum específico
# Formato de cada item: { "value": <str>, "label": <str> }
# ============================================================

ENUM_GROUPS = {
    "veiculo": {
        "categoria": Veiculo.CATEGORIA_CHOICES,
        "unidade_consumo": Veiculo.UNIDADE_CONSUMO_CHOICES,
    },
    "guia": {
        "modalidade": GuiaAbastecimento.MODALIDADE_CHOICES,
        "tipo_veiculo": GuiaAbastecimento.TIPO_VEICULO_CHOICES,
    },
    "instituicao": {
        "tipo": Instituicao.TIPO_CHOICES,
    },
}


def _as_options(choices):
    return [{"value": value, "label": label} for value, label in choices]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def choices(request, grupo=None, campo=None):
    if grupo is not None and campo is not None:
        grupo_fields = ENUM_GROUPS.get(grupo)
        if grupo_fields is None or campo not in grupo_fields:
            return Response(
                {"detail": f"Enum desconhecido: {grupo}.{campo}"},
                status=404,
            )
        return Response(_as_options(grupo_fields[campo]))

    return Response(
        {
            grupo: {campo: _as_options(opcoes) for campo, opcoes in campos.items()}
            for grupo, campos in ENUM_GROUPS.items()
        }
    )


class BaseModelViewSet(viewsets.ModelViewSet):
    read_serializer_class = None
    write_serializer_class = None
    lookup_serializer_class = None

    def get_serializer_class(self):
        if self.action == 'lookup' and self.lookup_serializer_class:
            return self.lookup_serializer_class

        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return self.read_serializer_class

        return self.write_serializer_class

    def get_lookup_queryset(self, queryset):
        """
        Sobrescrever se precisar otimizar
        """
        return queryset

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        if 'ativo' not in request.query_params:
            if hasattr(queryset.model, 'ativo'):
                queryset = queryset.filter(ativo=True)

        queryset = self.get_lookup_queryset(queryset)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
