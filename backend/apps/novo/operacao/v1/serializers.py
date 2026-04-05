from rest_framework import serializers
from .models import OperadorVeiculo, Guia, AlocacaoServico, TipoServico

from apps.novo.pessoas.v1.models import Pessoa
from apps.novo.frota.v1.models import Veiculo, Rota
from apps.novo.organizacao.v1.models import Secretaria


# --- SERIALIZERS DE TipoServico ---

class TipoServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoServico
        fields = ['id', 'nome']


class TipoServicoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')

    class Meta:
        model = TipoServico
        fields = ['value', 'label']


# --- SERIALIZERS DE AlocacaoServico ---

class AlocacaoServicoReadSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.IntegerField(source='pessoa.id', read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    tipo_servico_id = serializers.IntegerField(source='tipo_servico.id', read_only=True)
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)

    class Meta:
        model = AlocacaoServico
        fields = ['id', 'pessoa_id', 'pessoa_nome', 'tipo_servico_id', 'tipo_servico_nome', 'is_principal']


class AlocacaoServicoWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    tipo_servico_id = serializers.PrimaryKeyRelatedField(source='tipo_servico', queryset=TipoServico.objects.all())

    class Meta:
        model = AlocacaoServico
        fields = ['id', 'pessoa_id', 'tipo_servico_id', 'is_principal']

# --- SERIALIZERS DE OPERADOR DE VEÍCULO ---

class OperadorVeiculoReadSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.IntegerField(source='pessoa.id', read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    
    veiculo_id = serializers.IntegerField(source='veiculo.id', read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)
    veiculo_modelo = serializers.CharField(source='veiculo.modelo', read_only=True)

    class Meta:
        model = OperadorVeiculo
        fields = ['id', 'pessoa_id', 'pessoa_nome', 'veiculo_id', 'veiculo_placa', 'veiculo_modelo', 'is_principal']


class OperadorVeiculoWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    veiculo_id = serializers.PrimaryKeyRelatedField(source='veiculo', queryset=Veiculo.objects.all())

    class Meta:
        model = OperadorVeiculo
        fields = ['id', 'pessoa_id', 'veiculo_id', 'is_principal']


# --- SERIALIZERS DE GUIA (ABASTECIMENTO) ---

class GuiaReadSerializer(serializers.ModelSerializer):
    # Tradução das 5 Chaves Estrangeiras para o Frontend
    pessoa_id = serializers.IntegerField(source='pessoa.id', read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)

    veiculo_id = serializers.IntegerField(source='veiculo.id', read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)

    rota_id = serializers.IntegerField(source='rota.id', read_only=True)
    rota_nome = serializers.CharField(source='rota.nome', read_only=True)

    tipo_servico_id = serializers.IntegerField(source='tipo_servico.id', read_only=True)
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)

    secretaria_id = serializers.IntegerField(source='secretaria.id', read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)

    class Meta:
        model = Guia
        fields = [
            'id', 'data_hora', 'quantidade_combustivel', 'quantidade_oleo', 'hodometro_atual',
            'pessoa_id', 'pessoa_nome',
            'veiculo_id', 'veiculo_placa',
            'rota_id', 'rota_nome',
            'tipo_servico_id', 'tipo_servico_nome',
            'secretaria_id', 'secretaria_nome'
        ]


class GuiaWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    veiculo_id = serializers.PrimaryKeyRelatedField(source='veiculo', queryset=Veiculo.objects.all())
    rota_id = serializers.PrimaryKeyRelatedField(source='rota', queryset=Rota.objects.all())
    tipo_servico_id = serializers.PrimaryKeyRelatedField(source='tipo_servico', queryset=TipoServico.objects.all())
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all())

    class Meta:
        model = Guia
        fields = [
            'id', 'data_hora', 'quantidade_combustivel', 'quantidade_oleo', 'hodometro_atual',
            'pessoa_id', 'veiculo_id', 'rota_id', 'tipo_servico_id', 'secretaria_id'
        ]
