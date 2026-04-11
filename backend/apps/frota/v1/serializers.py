from rest_framework import serializers
from apps.frota.models import Veiculo, Rota, TipoCombustivel, TipoVeiculo
from apps.organizacao.models import Secretaria, Instituicao

# --- SERIALIZERS DE VEÍCULO ---

# DTO de Escrita
class VeiculoWriteSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all())
    tipo_combustivel_id = serializers.PrimaryKeyRelatedField(source='tipo_combustivel', queryset=TipoCombustivel.objects.all())
    tipo_veiculo_id = serializers.PrimaryKeyRelatedField(source='tipo_veiculo', queryset=TipoVeiculo.objects.all())

    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'tipo_locomocao', 
            'capacidade_carga_kg', 'capacidade_pessoas', 
            'consumo_estimado_combustivel', 'consumo_estimado_oleo',
            'unidade_consumo', 'hodometro_atual', 
            'secretaria_id', 'tipo_combustivel_id', 'tipo_veiculo_id',
            'ativo'
        ]

# DTO de Leitura
class VeiculoReadSerializer(serializers.ModelSerializer):
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    tipo_combustivel_id = serializers.IntegerField(read_only=True)
    tipo_combustivel_nome = serializers.CharField(source='tipo_combustivel.nome', read_only=True)    

    tipo_veiculo_id = serializers.IntegerField(read_only=True)
    tipo_veiculo_nome = serializers.CharField(source='tipo_veiculo.nome', read_only=True)
    
    tipo_locomocao_display = serializers.CharField(source='get_tipo_locomocao_display', read_only=True)
    unidade_consumo_display = serializers.CharField(source='get_unidade_consumo_display', read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'id', 'modelo', 'placa', 'ativo',
            'consumo_estimado_combustivel', 'consumo_estimado_oleo', 
            'unidade_consumo', 'unidade_consumo_display',
            'hodometro_atual', 'capacidade_carga_kg', 'capacidade_pessoas',
            'tipo_locomocao', 'tipo_locomocao_display',
            'tipo_combustivel_id', 'tipo_combustivel_nome',
            'tipo_veiculo_id', 'tipo_veiculo_nome',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla'
        ]

# DTO de Lookup
class VeiculoLookupSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    value = serializers.ReadOnlyField(source='id')

    secretaria_id = serializers.IntegerField(read_only=True)
    tipo_combustivel_id = serializers.IntegerField(read_only=True)
    tipo_veiculo_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Veiculo
        fields = [
            'value', 'label', 'ativo',
            'consumo_estimado_combustivel', 'consumo_estimado_oleo', 'unidade_consumo',
            'tipo_combustivel_id', 'tipo_veiculo_id', 'secretaria_id'
        ]

    def get_label(self, obj: Veiculo):
        nome_combustivel = obj.tipo_combustivel.nome if obj.tipo_combustivel else "N/I"
        return f"{obj.modelo} - {obj.placa} ({nome_combustivel})"


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
            'secretaria_id', 'instituicao_id', 'ativa', 'detalhes'
        ]

# DTO de Leitura
class RotaReadSerializer(serializers.ModelSerializer):
    # Relacionamento: Secretaria
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)
    
    # Relacionamento: Instituição
    instituicao_id = serializers.IntegerField(read_only=True)
    instituicao_nome = serializers.CharField(source='instituicao.nome', read_only=True)
    
    # Displays
    tipo_locomocao_nome = serializers.CharField(source='get_tipo_locomocao_display', read_only=True)

    class Meta:
        model = Rota
        fields = [
            'id', 'nome', 'distancia_km', 'ativa',
            'tipo_locomocao', 'tipo_locomocao_nome',
            'consumo_estimado_combustivel', 'consumo_estimado_oleo', 
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'instituicao_id', 'instituicao_nome',
            'detalhes'
        ]

# DTO de Lookup
class RotaLookupSerializer(serializers.ModelSerializer):
    """
    Serializer para o Select de Rotas.
    """
    label = serializers.ReadOnlyField(source='nome')
    value = serializers.ReadOnlyField(source='id')

    secretaria_id = serializers.IntegerField(read_only=True)
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


# --- SERIALIZERS DE TipoCombustivel ---

class TipoCombustivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCombustivel
        fields = "__all__"

class TipoCombustivelLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')
    
    class Meta:
        model = TipoCombustivel
        fields = [
            'value',
            'label',
        ]

# --- SERIALIZERS DE TipoVeiculo ---

class TipoVeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVeiculo
        fields = "__all__"

class TipoVeiculoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')
    
    class Meta:
        model = TipoVeiculo
        fields = [
            'value',
            'label',
        ]

