from rest_framework import serializers
from apps.pessoas.models import Pessoa

class PessoaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pessoa
        fields = ['id', 'cpf', 'nome', 'ativo']

class PessoaLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()

    class Meta:
        model = Pessoa
        fields = ['value', 'label', 'cpf'] 

    def get_label(self, obj: Pessoa):
        return f"{obj.nome} ({obj.cpf})"