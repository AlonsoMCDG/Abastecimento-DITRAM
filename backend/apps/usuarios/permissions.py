from rest_framework.permissions import BasePermission


class AuthenticatedPermission(BasePermission):
    """Permissão única da API: usuário autenticado."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
