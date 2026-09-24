from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status

from apps.usuarios.models import Usuario
from apps.organizacao.models import Secretaria, Instituicao


class OrganizacaoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            cpf="77777777777",
            password="testpassword",
            can_write_cadastros=True
        )
        self.client.force_authenticate(user=self.user)

    def test_secretaria_sigla_normalizada(self):
        sec = Secretaria.objects.create(nome="Secretaria Municipal de Obras", sigla="semo")
        self.assertEqual(sec.sigla, "SEMO")

    def test_instituicao_unique_per_secretaria(self):
        sec = Secretaria.objects.create(nome="Educacao Nova", sigla="SEMEX")
        Instituicao.objects.create(nome="Escola Modelo", tipo="ESCOLA", secretaria=sec)

        # Mesma escola na mesma secretaria deve falhar
        with self.assertRaises(ValidationError):
            inst_dup = Instituicao(nome="Escola Modelo", tipo="ESCOLA", secretaria=sec)
            inst_dup.full_clean()

    def test_secretaria_viewset_endpoints(self):
        Secretaria.objects.create(nome="Secretaria Especial", sigla="SESP")
        res = self.client.get("/api/v1/organizacao/secretarias/lookup/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertGreaterEqual(len(data), 1)


