from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    UsuarioSelfUpdateSerializer,
    UsuarioLookupSerializer
)

class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all().only(
        "id", "cpf", "first_name", "last_name", "email",
        "is_staff", "is_superuser", "is_active"
    ).order_by("id")
        
    permission_classes = [IsAdminUser]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['id', 'cpf', 'is_staff', 'is_superuser', 'is_active']
    search_fields = ['first_name', 'last_name', 'cpf', 'email']
    ordering_fields = ['id', 'first_name', 'cpf', 'is_staff', 'is_superuser']

    def get_permissions(self):
        if self.action in ('me', 'lookup'):
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'me':
            return UsuarioSelfUpdateSerializer if self.request.method in ['PUT', 'PATCH'] else UsuarioSerializer
        
        if self.action == 'lookup':
            return UsuarioLookupSerializer
            
        return UsuarioSerializer


    # ==========================================
    # ACTIONS CUSTOMIZADAS
    # ==========================================

    @action(detail=False, methods=['get'], serializer_class=UsuarioLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        if 'is_active' not in request.query_params:
            queryset = queryset.filter(is_active=True)
        queryset = queryset.only('id', 'first_name', 'last_name', 'cpf')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        serializer = UsuarioSelfUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioSerializer(user).data)

