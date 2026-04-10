from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Usuario
from .serializers import (
    UsuarioSerializer,
    UsuarioRegisterSerializer,
    UsuarioPermissionsSerializer,
    UsuarioSelfUpdateSerializer,
)

class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all().order_by("id")
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]
    
    # Filtros e Busca para o DataTable
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'cpf', 'email']
    ordering_fields = ['id', 'first_name', 'cpf', 'is_staff', 'is_superuser']

    def get_permissions(self):
        if getattr(self, "action", None) == "me":
            return [IsAuthenticated()]
        if getattr(self, "action", None) in ("permissions_list", "permissions_update"):
            return [IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "GET":
            serializer = UsuarioPermissionsSerializer(request.user)
            return Response(serializer.data)

        serializer = UsuarioSelfUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioPermissionsSerializer(user).data)

    @action(detail=False, methods=["get"], url_path="permissions")
    def permissions_list(self, request):
        # Filtros e paginação
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = UsuarioPermissionsSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Fallback caso a paginação esteja desativada globalmente
        serializer = UsuarioPermissionsSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="permissions")
    def permissions_update(self, request, pk=None):
        target = self.get_object()
        acting = request.user
        
        # Proteções de hierarquia
        if target.is_staff and not acting.is_superuser:
            return Response(
                {"detail": "Apenas o superadmin pode alterar permissões de usuários admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "is_superuser" in request.data and not acting.is_superuser:
            return Response(
                {"detail": "Apenas o superadmin pode promover superadmin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if "is_staff" in request.data and request.data.get("is_staff") and not acting.is_superuser:
            return Response(
                {"detail": "Apenas o superadmin pode promover usuários para admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = UsuarioPermissionsSerializer(target, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UsuarioRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UsuarioPermissionsSerializer(user).data, status=status.HTTP_201_CREATED)
