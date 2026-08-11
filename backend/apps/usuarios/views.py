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
        # Como o Lookup preenche campos da tela de Guia (ex: "Emitido Por"), 
        # qualquer usuário logado deve poder consultá-lo.
        if getattr(self, "action", None) in ("me", "lookup"):
            return [IsAuthenticated()]
        if getattr(self, "action", None) in ("permissions_list", "permissions_update"):
            return [IsAdminUser()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'me':
            if self.request.method in ['PUT', 'PATCH']:
                return UsuarioSelfUpdateSerializer
            return UsuarioPermissionsSerializer
        
        if self.action == 'lookup':
            return UsuarioLookupSerializer
            
        if self.action in ['permissions_list', 'permissions_update']:
            return UsuarioPermissionsSerializer
            
        return UsuarioSerializer


    # ==========================================
    # ACTIONS CUSTOMIZADAS
    # ==========================================
    # Usam get_serializer para aproveitar o get_serializer_class

    @action(detail=False, methods=['get'], serializer_class=UsuarioLookupSerializer)
    def lookup(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtra usuários ativos por padrão (Note que o campo padrão do Django é is_active)
        if 'is_active' not in request.query_params:
            queryset = queryset.filter(is_active=True)

        # Otimização
        queryset = queryset.only('id', 'first_name', 'last_name', 'cpf')

        # Usa get_serializer para injetar contexto automaticamente
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioPermissionsSerializer(user).data)


    @action(detail=False, methods=["get"], url_path="permissions")
    def permissions_list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
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

        serializer = self.get_serializer(target, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ==========================================
# ENDPOINTS DESVINCULADOS (PUBLICOS)
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = UsuarioRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({
        "id": user.id,
        "cpf": user.cpf,
        "nome": user.get_full_name(),
    }, status=status.HTTP_201_CREATED)