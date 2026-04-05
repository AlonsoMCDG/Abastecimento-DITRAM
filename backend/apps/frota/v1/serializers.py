from rest_framework import serializers
from apps.frota.models import Veiculo, Rota
from apps.organizacao.models import Secretaria, Instituicao

# --- SERIALIZERS DE VEÍCULO ---

# DTO de Escrita
class VeiculoWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria', 
        queryset=Secretaria.objects.all()
    )

    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'tipo_locomocao', 
            'capacidade_carga_kg', 'capacidade_pessoas', 
            'tipo_combustivel', 'consumo_estimado_combustivel', 
            'consumo_estimado_oleo', 'hodometro_atual', 
            'unidade_consumo', 'secretaria_id'
        ]

# DTO de Leitura
class VeiculoReadSerializer(serializers.ModelSerializer):
    # Relacionamentos
    secretaria_id = serializers.IntegerField(source='secretaria.id', read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    
    # Displays (Choices)
    tipo_locomocao_display = serializers.CharField(source='get_tipo_locomocao_display', read_only=True)
    tipo_combustivel_display = serializers.CharField(source='get_tipo_combustivel_display', read_only=True)
    unidade_consumo_display = serializers.CharField(source='get_unidade_consumo_display', read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'tipo_combustivel', 'tipo_combustivel_display',
            'consumo_estimado_combustivel', 'unidade_consumo', 'unidade_consumo_display',
            'tipo_locomocao', 'tipo_locomocao_display',
            'secretaria_id', 'secretaria_nome'
        ]

# DTO de Lookup
class VeiculoLookupSerializer(serializers.ModelSerializer):
    """
    Serializer para o Select de Veículos.
    """
    label = serializers.SerializerMethodField()
    value = serializers.ReadOnlyField(source='id')

    secretaria_id = serializers.ReadOnlyField()
    tipo_combustivel_display = serializers.CharField(source='get_tipo_combustivel_display', read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'value', # ID no banco de dados
            'label', # Retorno da função 'get_label()'
            'tipo_combustivel', 
            'tipo_combustivel_display',
            'consumo_estimado_combustivel', 
            'unidade_consumo',
            'secretaria_id'
        ]

    def get_label(self, obj: Veiculo):
        # Formatação: "Hilux - ABC1234 (Diesel S10)"
        return f"{obj.modelo} - {obj.placa} ({obj.get_tipo_combustivel_display()})"


# --- SERIALIZERS DE ROTA ---

# DTO de Escrita
class RotaWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria', 
        queryset=Secretaria.objects.all()
    )
    instituicao_id = serializers.PrimaryKeyRelatedField(
        source='instituicao', 
        queryset=Instituicao.objects.all()
    )

    class Meta:
        model = Rota
        fields = [
            'id', 'nome', 'distancia_km', 'tipo_locomocao', 
            'consumo_estimado_combustivel', 'consumo_estimado_oleo', 
            'secretaria_id', 'instituicao_id', 'ativa'
        ]

# DTO de Leitura
class RotaReadSerializer(serializers.ModelSerializer):
    # Relacionamento: Secretaria
    secretaria_id = serializers.IntegerField(source='secretaria.id', read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    
    # Relacionamento: Instituição
    instituicao_id = serializers.IntegerField(source='instituicao.id', read_only=True)
    instituicao_nome = serializers.CharField(source='instituicao.nome', read_only=True)
    
    # Displays
    tipo_locomocao_display = serializers.CharField(source='get_tipo_locomocao_display', read_only=True)

    class Meta:
        model = Rota
        fields = [
            'id', 'nome', 'distancia_km', 'ativa',
            'tipo_locomocao', 'tipo_locomocao_display',
            'secretaria_id', 'secretaria_nome',
            'instituicao_id', 'instituicao_nome'
        ]

# DTO de Lookup
class RotaLookupSerializer(serializers.ModelSerializer):
    """
    Serializer para o Select de Rotas.
    """
    label = serializers.ReadOnlyField(source='nome')
    value = serializers.ReadOnlyField(source='id')

    secretaria_id = serializers.IntegerField(source='secretaria.id', read_only=True)
    instituicao_id = serializers.IntegerField(source='instituicao.id', read_only=True)

    class Meta:
        model = Rota
        fields = [
            'value',  # ID da rota no banco de dados
            'label',  # Campo 'nome' da rota
            'distancia_km', 
            'tipo_locomocao', 
            'secretaria_id', 
            'instituicao_id'
        ]
