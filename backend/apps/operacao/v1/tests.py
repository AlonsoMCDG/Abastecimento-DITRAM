from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from apps.usuarios.models import Usuario
from apps.organizacao.models import Secretaria
from apps.frota.models import TipoCombustivel, Veiculo, Rota
from apps.operacao.models import TipoAtividade, GuiaAbastecimento
from apps.pessoas.models import Pessoa


class OperacaoV1Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            cpf="11122233344",
            password="testpassword",
            first_name="Operador",
            last_name="Teste",
            can_create_guia_abastecimento=True
        )
        self.client.force_authenticate(user=self.user)

        self.sec = Secretaria.objects.create(nome="Secretaria Municipal de Educacao", sigla="SEME")
        self.combustivel_gasolina = TipoCombustivel.objects.create(nome="Gasolina")
        self.combustivel_diesel = TipoCombustivel.objects.create(nome="Diesel S10")

        self.veiculo = Veiculo.objects.create(
            modelo="Onibus Volare",
            placa="ABC1D23",
            categoria="ONIBUS",
            tipo_combustivel=self.combustivel_diesel,
            consumo_estimado_combustivel=Decimal("3.5"),
            unidade_consumo="KM_POR_L"
        )

        self.rota = Rota.objects.create(
            nome="Linha Escolar Rural",
            secretaria=self.sec,
            distancia_km=Decimal("28.0")
        )

        self.atividade = TipoAtividade.objects.create(nome="Transporte de Alunos")

        self.pessoa = Pessoa.objects.create(
            nome="Joao Motorista",
            cpf="12345678901"
        )

        # Cria guia
        self.guia = GuiaAbastecimento.objects.create(
            data_hora=timezone.now(),
            modalidade="ONIBUS",
            usuario=self.user,
            secretaria=self.sec,
            tipo_atividade=self.atividade,
            rota=self.rota,
            pessoa=self.pessoa,
            veiculo=self.veiculo,
            tipo_combustivel=self.combustivel_diesel,
            quantidade_combustivel=Decimal("50.0"),
            quantidade_oleo=Decimal("1.5")
        )

    def test_sugestoes_endpoint(self):
        url = f"/api/v1/operacao/guias/sugestoes/?pessoa={self.pessoa.id}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn("veiculo", data)
        self.assertIn("tipo_atividade", data)
        self.assertIn("secretaria", data)
        self.assertIn("rota", data)
        self.assertIn("modalidade", data)

        self.assertEqual(data["veiculo"]["value"], self.veiculo.id)
        self.assertEqual(data["tipo_atividade"]["value"], self.atividade.id)
        self.assertEqual(data["secretaria"]["value"], self.sec.id)
        self.assertEqual(data["rota"]["value"], self.rota.id)
        self.assertEqual(data["modalidade"], "ONIBUS")

    def test_relatorio_consolidado_endpoint(self):
        url = "/api/v1/operacao/guias/relatorio-consolidado/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("kpis", data)
        self.assertEqual(data["kpis"]["total_combustivel"], 50.0)
        self.assertEqual(data["kpis"]["total_oleo"], 1.5)
        self.assertEqual(data["kpis"]["total_guias"], 1)
        self.assertEqual(data["kpis"]["total_veiculos"], 1)

        self.assertIn("por_secretaria", data)
        self.assertEqual(len(data["por_secretaria"]), 1)
        self.assertEqual(data["por_secretaria"][0]["sigla"], "SEME")

        self.assertIn("por_tipo_combustivel", data)
        self.assertEqual(len(data["por_tipo_combustivel"]), 1)
        self.assertEqual(data["por_tipo_combustivel"][0]["nome"], "Diesel S10")

        self.assertIn("por_modalidade", data)
        self.assertEqual(len(data["por_modalidade"]), 1)
        self.assertEqual(data["por_modalidade"][0]["modalidade"], "ONIBUS")

