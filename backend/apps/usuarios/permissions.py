from rest_framework.permissions import BasePermission, SAFE_METHODS


class BaseMethodPermission(BasePermission):
    permission_map = {}

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        if not (user and user.is_authenticated):
            return False

        if user.is_staff:
            return True

        required_flag = self.permission_map.get(request.method)

        if not required_flag:
            return False

        return bool(getattr(user, required_flag, False))

class CadastrosPermission(BaseMethodPermission):
    permission_map = {
        "POST": "can_write_cadsatros",
        "PUT": "can_write_cadsatros",
        "PATCH": "can_write_cadsatros",
        "DELETE": "can_write_cadsatros",
    }


class FrotaPermission(BaseMethodPermission):
    permission_map = {
        "POST": "can_write_frota",
        "PUT": "can_write_frota",
        "PATCH": "can_write_frota",
        "DELETE": "can_write_frota",
    }


class GuiaAbastecimentoPermission(BaseMethodPermission):
    permission_map = {
        "POST": "can_create_guia_abastecimento",
        "PUT": "can_edit_guia_abastecimento",
        "PATCH": "can_edit_guia_abastecimento",
        "DELETE": "can_delete_guia_abastecimento",
    }
