from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from apps.usuarios.models import Usuario
from apps.organizacao.models import Secretaria
from apps.frota.models import TipoCombustivel, Veiculo, Rota
from apps.operacao.models import TipoAtividade, GuiaAbastecimento
from apps.pessoas.models import Pessoa
from apps.operacao.services.pdf_service import _draw_guia_impressao_copy


class OperacaoV1Tests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            cpf="11122233344",
            password="testpassword",
            first_name="Operador",
            last_name="Teste",
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
        self.assertEqual(data["por_modalidade"][0]["modalidade_nome"], "ONIBUS")

    def test_tipo_equipamento_persiste_com_veiculo_cadastrado_ou_manual(self):
        url = f"/api/v1/operacao/guias/{self.guia.id}/"
        response = self.client.patch(url, {"tipo_veiculo": "Micro-ônibus"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["tipo_veiculo"], "Micro-ônibus")

        self.guia.refresh_from_db()
        self.assertEqual(self.guia.tipo_veiculo, "Micro-ônibus")
        self.assertIn("Micro-ônibus", self.guia.veiculo_display)
        pdf_response = self.client.get(f"{url}pdf/")
        self.assertEqual(pdf_response.status_code, status.HTTP_200_OK)
        self.assertTrue(pdf_response.content.startswith(b"%PDF"))

        self.guia.modalidade = "Roçagem"
        pdf = canvas.Canvas(BytesIO(), pagesize=A4)
        textos = []
        draw_string = pdf.drawString

        def registrar_texto(x, y, value):
            textos.append(str(value))
            return draw_string(x, y, value)

        pdf.drawString = registrar_texto
        _draw_guia_impressao_copy(pdf, self.guia, A4[1] / 2, A4[1])
        self.assertIn("Linha Escolar Rural", textos)
        self.assertTrue(any("Micro-ônibus" in value for value in textos))
        self.assertTrue(any(value.startswith("Nome do Responsável") for value in textos))

        response = self.client.post("/api/v1/operacao/guias/", {
            "data_hora": timezone.now().isoformat(),
            "modalidade": "Roçagem",
            "secretaria_id": self.sec.id,
            "pessoa_id": self.pessoa.id,
            "veiculo_id": None,
            "veiculo_descricao": "Corote",
            "tipo_veiculo": "Recipiente",
            "tipo_combustivel_id": self.combustivel_diesel.id,
            "quantidade_combustivel": "5.000",
            "rota_manual": "Serviço externo",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["veiculo_descricao"], "Corote")
        self.assertEqual(response.json()["tipo_veiculo"], "Recipiente")
        self.assertEqual(response.json()["veiculo_display"], "Corote (Recipiente)")
