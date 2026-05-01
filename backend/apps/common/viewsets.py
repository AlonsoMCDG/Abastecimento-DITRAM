from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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
