from rest_framework import serializers
from apps.pessoas.models import Pessoa, Funcao


class FuncaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcao
        fields = ['id', 'nome']


# --- DTO de Escrita (Recebe array de IDs) ---
class PessoaWriteSerializer(serializers.ModelSerializer):
    # O frontend enviará: { "nome": "João", "cpf": "123", "funcoes": [1, 3] }
    funcoes = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Funcao.objects.all()
    )

    class Meta:
        model = Pessoa
        fields = ['id', 'cpf', 'nome', 'funcoes', 'ativo']


# --- DTO de Leitura (Envia detalhes amigáveis) ---
class PessoaReadSerializer(serializers.ModelSerializer):
    # Retorna uma lista de strings (ex: ["Motorista", "Roçador"]) para facilitar na tabela do frontend
    funcoes_nomes = serializers.SlugRelatedField(
        many=True, 
        read_only=True, 
        slug_field='nome', 
        source='funcoes'
    )
    # Mantém os IDs também, caso o frontend precise carregar o formulário de edição
    funcoes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Pessoa
        fields = ['id', 'cpf', 'nome', 'funcoes', 'funcoes_nomes', 'ativo']


# --- DTO de Lookup (Para Selects) ---
class PessoaLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()
    
    # Útil para o frontend desabilitar opções dependendo do tipo da guia
    funcoes = serializers.SlugRelatedField(
        many=True, 
        read_only=True, 
        slug_field='nome'
    )

    class Meta:
        model = Pessoa
        fields = ['value', 'label', 'cpf', 'funcoes'] 

    def get_label(self, obj: Pessoa):
        return f"{obj.nome} ({obj.cpf})"