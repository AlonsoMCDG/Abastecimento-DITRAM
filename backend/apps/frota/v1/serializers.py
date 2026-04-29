from rest_framework import serializers
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria

# ==========================================
# SERIALIZERS DE VEÍCULO
# ==========================================

class VeiculoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'categoria', 
            'capacidade_carga_kg', 'capacidade_pessoas', 
            'consumo_estimado_combustivel', 'unidade_consumo', 
            'hodometro_atual', 'ativo'
        ]

class VeiculoReadSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='get_categoria_display', read_only=True)
    unidade_consumo_nome = serializers.CharField(source='get_unidade_consumo_display', read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'categoria', 'categoria_nome', 'ativo',
            'consumo_estimado_combustivel', 'unidade_consumo', 'unidade_consumo_nome',
            'hodometro_atual', 'capacidade_carga_kg', 'capacidade_pessoas'
        ]

class VeiculoLookupSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.ReadOnlyField(source='id')

    class Meta:
        model = Veiculo
        fields = ['value', 'label', 'categoria']

    def get_label(self, obj: Veiculo):
        return f"{obj.modelo} - {obj.placa}"


# ==========================================
# SERIALIZERS DE ROTA
# ==========================================

class RotaWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria', 
        queryset=Secretaria.objects.all()
    )

    class Meta:
        model = Rota
        fields = ['id', 'nome', 'distancia_km', 'secretaria_id', 'ativa', 'detalhes']

class RotaReadSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    class Meta:
        model = Rota
        fields = [
            'id', 'nome', 'distancia_km', 'ativa',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'detalhes'
        ]

class RotaLookupSerializer(serializers.ModelSerializer):
    label = serializers.ReadOnlyField(source='nome')
    value = serializers.ReadOnlyField(source='id')
    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Rota
        fields = ['value', 'label', 'distancia_km', 'secretaria_id']


# ==========================================
# SERIALIZERS DE TIPO COMBUSTÍVEL
# ==========================================

class TipoCombustivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCombustivel
        fields = "__all__"

class TipoCombustivelLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')
    
    class Meta:
        model = TipoCombustivel
        fields = ['value', 'label']
