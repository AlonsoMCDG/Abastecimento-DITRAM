from rest_framework import serializers
from apps.organizacao.models import Secretaria, Instituicao


# --- SERIALIZERS DE Secretaria ---

class SecretariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secretaria
        fields = ['id', 'nome', 'sigla', 'ativo']

class SecretariaLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()  
    
    class Meta:
        model = Secretaria
        fields = [
            'value',  
            'label',  
        ]

    def get_label(self, obj: Secretaria):
        # Formatação: "SEME - Secretaria Municipal de Educação"
        return f"{obj.sigla} - {obj.nome}"


# --- SERIALIZERS DE ROTA ---

# DTO de Escrita 
class InstituicaoWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria', 
        queryset=Secretaria.objects.all()
    )
    
    class Meta:
        model = Instituicao
        fields = ['id', 'nome', 'tipo', 'secretaria_id', 'ativo']

# DTO de Leitura 
class InstituicaoReadSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)
    tipo_nome = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Instituicao
        fields = [
            'id', 'nome', 'tipo', 'tipo_nome', 'ativo', 
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla'
        ]

class InstituicaoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()
    secretaria_id = serializers.IntegerField(read_only=True) # Útil para o frontend filtrar dropdowns
    
    class Meta:
        model = Instituicao
        fields = ['value', 'label', 'secretaria_id']

    def get_label(self, obj: Instituicao):
        # Formatação limpa para o Select: "Escola - João das Neves"
        return f"{obj.get_tipo_display()} - {obj.nome}"
