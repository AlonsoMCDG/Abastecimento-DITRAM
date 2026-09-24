from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status

from apps.usuarios.models import Usuario
from apps.pessoas.models import Pessoa


class PessoaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            cpf="88888888888",
            password="testpassword",
            can_write_cadastros=True
        )
        self.client.force_authenticate(user=self.user)

    def test_pessoa_model_format_nome_e_cpf(self):
        pessoa = Pessoa.objects.create(
            nome="joao da silva rodrigues",
            cpf="123.456.789-01"
        )
        self.assertEqual(pessoa.nome, "Joao da Silva Rodrigues")
        self.assertEqual(pessoa.cpf, "12345678901")

    def test_pessoa_cpf_invalido(self):
        with self.assertRaises(ValidationError):
            p = Pessoa(nome="Invalido", cpf="12345")
            p.full_clean()

    def test_pessoa_viewset_list_and_lookup(self):
        p1 = Pessoa.objects.create(nome="Motorista A", cpf="11111111111")
        Pessoa.objects.create(nome="Motorista B", cpf="22222222222", ativo=False)

        res_list = self.client.get("/api/v1/pessoas/base/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        data = res_list.json()
        self.assertEqual(data["count"], 2)

        # Lookup deve retornar apenas ativos por padrão com value/label
        res_lookup = self.client.get("/api/v1/pessoas/base/lookup/")
        self.assertEqual(res_lookup.status_code, status.HTTP_200_OK)
        lookup_data = res_lookup.json()
        self.assertEqual(len(lookup_data), 1)
        self.assertEqual(lookup_data[0]["label"], "Motorista A")
        self.assertEqual(lookup_data[0]["value"], p1.id)


