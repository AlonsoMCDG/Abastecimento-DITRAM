from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.usuarios.models import Usuario


class UsuarioTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.filter(cpf="99999999999").first()
        if not self.admin:
            self.admin = Usuario.objects.create_superuser(
                cpf="99999999999",
                password="adminpassword",
                first_name="Admin",
                last_name="Master"
            )
        self.operador = Usuario.objects.create_user(
            cpf="555.444.333-22",
            password="userpassword",
            first_name="Operador",
            last_name="Comum"
        )

    def test_usuario_cpf_limpo(self):
        self.assertEqual(self.operador.cpf, "55544433322")

    def test_login_jwt_por_cpf(self):
        res = self.client.post("/api/login/", {
            "cpf": "55544433322",
            "password": "userpassword"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_perfil_me_endpoint(self):
        self.client.force_authenticate(user=self.operador)
        res = self.client.get("/api/v1/usuarios/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertEqual(data["cpf"], "55544433322")
        self.assertEqual(data["first_name"], "Operador")


