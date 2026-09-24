from django.test import TestCase
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status

from apps.usuarios.models import Usuario
from apps.organizacao.models import Secretaria
from apps.frota.models import TipoCombustivel, Veiculo, Rota


class FrotaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            cpf="66666666666",
            password="testpassword",
            can_write_frota=True
        )
        self.client.force_authenticate(user=self.user)

        self.combustivel = TipoCombustivel.objects.create(nome="Diesel Comum")
        self.sec = Secretaria.objects.create(nome="Meio Ambiente", sigla="SEMA")

    def test_veiculo_placa_normalizada(self):
        veiculo = Veiculo.objects.create(
            modelo="Caminhonete Hilux",
            placa="abc-1234",
            categoria="CAMINHONETE",
            tipo_combustivel=self.combustivel,
            consumo_estimado_combustivel=Decimal("9.5")
        )
        self.assertEqual(veiculo.placa, "ABC1234")

    def test_rota_slug_auto_generation(self):
        rota = Rota.objects.create(
            nome="Linha Ramal do Ouro",
            secretaria=self.sec,
            distancia_km=Decimal("45.0")
        )
        self.assertEqual(rota.slug, "linha-ramal-do-ouro")

    def test_veiculos_endpoints(self):
        Veiculo.objects.create(
            modelo="Onibus Escolar",
            placa="MZZ1234",
            categoria="ONIBUS",
            tipo_combustivel=self.combustivel
        )
        res = self.client.get("/api/v1/frota/veiculos/lookup/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertGreaterEqual(len(data), 1)


