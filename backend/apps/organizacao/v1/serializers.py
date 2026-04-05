from rest_framework import serializers
from apps.organizacao.models import Secretaria, Instituicao


# --- SERIALIZERS DE Secretaria ---

class SecretariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secretaria
        fields = "__all__"

class SecretariaLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()  # Retorno da função 'get_label()'
    
    class Meta:
        model = Secretaria
        fields = [
            'value',  # ID da instituição
            'label',  # Retorno da função 'get_label()'
        ]

    def get_label(self, obj: Secretaria):
        # Formatação: "SEME - Secretaria Municipal de Saúde"
        return f"{obj.sigla} - {obj.nome}"


# --- SERIALIZERS DE ROTA ---

# DTO de Escrita (Recebe o ID da secretaria para salvar no banco)
class InstituicaoWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria', 
        queryset=Secretaria.objects.all()
    )
    
    class Meta:
        model = Instituicao
        fields = ['id', 'nome', 'tipo', 'secretaria_id']

# DTO de Leitura (Retorna o ID e o Nome extra)
class InstituicaoReadSerializer(serializers.ModelSerializer):
    # Pega o ID e o Nome
    secretaria_id = serializers.IntegerField(source='secretaria.id', read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)

    class Meta:
        model = Instituicao
        # Além dos atributos da instituição, passa o ID e nome da secretaria
        fields = ['id', 'nome', 'tipo', 'secretaria_id', 'secretaria_nome']


class InstituicaoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')
    
    class Meta:
        model = Instituicao
        fields = [
            'value',  # ID da instituição
            'label',  # Campo 'nome'
        ]
