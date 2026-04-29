from rest_framework import serializers
from django.db import transaction
from apps.operacao.models import (
    TipoAtividade, AlocacaoServico, OperadorVeiculo, 
    GuiaAbastecimento, RegistroHodometroDiario
)

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao


# ==========================================
# SERIALIZERS DE TIPO DE ATIVIDADE
# ==========================================
class TipoAtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAtividade
        fields = ['id', 'nome', 'ativo']

class TipoAtividadeLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='nome')

    class Meta:
        model = TipoAtividade
        fields = ['value', 'label']


# ==========================================
# SERIALIZERS DE ALOCAÇÃO DE ATIVIDADE
# ==========================================
class AlocacaoServicoReadSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    
    tipo_atividade_id = serializers.IntegerField(read_only=True)
    tipo_atividade_nome = serializers.CharField(source='tipo_atividade.nome', read_only=True)
    
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    class Meta:
        model = AlocacaoServico
        fields = [
            'id', 
            'pessoa_id', 'pessoa_nome', 
            'tipo_atividade_id', 'tipo_atividade_nome', 
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'is_principal'
        ]

class AlocacaoServicoWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    tipo_atividade_id = serializers.PrimaryKeyRelatedField(source='tipo_atividade', queryset=TipoAtividade.objects.all())
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all())

    class Meta:
        model = AlocacaoServico
        fields = ['id', 'pessoa_id', 'tipo_atividade_id', 'secretaria_id', 'is_principal']

class AlocacaoServicoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField() 
    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = AlocacaoServico
        fields = ['value', 'label', 'secretaria_id', 'is_principal']

    def get_label(self, obj):
        return f"{obj.pessoa.nome} - {obj.tipo_atividade.nome}"


# ==========================================
# SERIALIZERS DE OPERADOR DE VEÍCULO
# ==========================================
class OperadorVeiculoReadSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    
    veiculo_id = serializers.IntegerField(read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)
    veiculo_modelo = serializers.CharField(source='veiculo.modelo', read_only=True)

    class Meta:
        model = OperadorVeiculo
        fields = [
            'id', 
            'pessoa_id', 'pessoa_nome', 
            'veiculo_id', 'veiculo_placa', 'veiculo_modelo', 
            'is_principal'
        ]

class OperadorVeiculoWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    veiculo_id = serializers.PrimaryKeyRelatedField(source='veiculo', queryset=Veiculo.objects.all())

    class Meta:
        model = OperadorVeiculo
        fields = ['id', 'pessoa_id', 'veiculo_id', 'is_principal']

class OperadorVeiculoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='pessoa.nome')
    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = OperadorVeiculo
        fields = ['value', 'label', 'secretaria_id', 'is_principal']


# ==========================================
# SERIALIZERS DE GUIA DE ABASTECIMENTO
# ==========================================
class GuiaReadSerializer(serializers.ModelSerializer):
    modalidade_nome = serializers.CharField(source='get_modalidade_display', read_only=True)
    
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)

    veiculo_id = serializers.IntegerField(read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)

    rota_id = serializers.IntegerField(read_only=True)
    rota_nome = serializers.CharField(source='rota.nome', read_only=True, default=None)

    tipo_atividade_id = serializers.IntegerField(read_only=True)
    tipo_atividade_nome = serializers.CharField(source='tipo_atividade.nome', read_only=True)

    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    instituicao_id = serializers.IntegerField(read_only=True)
    instituicao_nome = serializers.CharField(source='instituicao.nome', read_only=True)

    tipo_combustivel_id = serializers.IntegerField(read_only=True)
    tipo_combustivel_nome = serializers.CharField(source='tipo_combustivel.nome', read_only=True)

    usuario_id = serializers.IntegerField(read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)

    class Meta:
        model = GuiaAbastecimento
        fields = [
            'id', 'data_hora', 'modalidade', 'modalidade_nome',
            'quantidade_litros', 'quantidade_oleo', 'periodo_uso_dias', 
            'observacao', 'identificacao_avulsa', 'rota_manual',
            
            # FKs Mapeadas
            'pessoa_id', 'pessoa_nome',
            'veiculo_id', 'veiculo_placa',
            'rota_id', 'rota_nome',
            'tipo_atividade_id', 'tipo_atividade_nome',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'instituicao_id', 'instituicao_nome',
            'tipo_combustivel_id', 'tipo_combustivel_nome',
            'usuario_id', 'usuario_nome',
            
            'criado_em', 'atualizado_em'
        ]

class GuiaWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    veiculo_id = serializers.PrimaryKeyRelatedField(source='veiculo', queryset=Veiculo.objects.all(), required=False, allow_null=True)
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all())
    instituicao_id = serializers.PrimaryKeyRelatedField(source='instituicao', queryset=Instituicao.objects.all(), required=False, allow_null=True)
    tipo_atividade_id = serializers.PrimaryKeyRelatedField(source='tipo_atividade', queryset=TipoAtividade.objects.all())
    tipo_combustivel_id = serializers.PrimaryKeyRelatedField(source='tipo_combustivel', queryset=TipoCombustivel.objects.all())
    rota_id = serializers.PrimaryKeyRelatedField(source='rota', queryset=Rota.objects.all(), required=False, allow_null=True)

    class Meta:
        model = GuiaAbastecimento
        fields = [
            'id', 'data_hora', 'modalidade', 'quantidade_litros', 'quantidade_oleo', 
            'periodo_uso_dias', 'observacao', 'rota_manual', 'identificacao_avulsa',
            'pessoa_id', 'veiculo_id', 'rota_id', 'tipo_atividade_id', 
            'secretaria_id', 'instituicao_id', 'tipo_combustivel_id'
        ]


# ==========================================
# SERIALIZERS DE REGISTRO DE HODÔMETRO
# ==========================================
class RegistroHodometroDiarioSerializer(serializers.ModelSerializer):
    guia_id = serializers.PrimaryKeyRelatedField(source='guia', queryset=GuiaAbastecimento.objects.all())
    
    class Meta:
        model = RegistroHodometroDiario
        fields = [
            'id', 'guia_id', 'data_referencia', 
            'hodometro_inicial', 'hodometro_final', 'distancia_percorrida'
        ]
        read_only_fields = ['distancia_percorrida']
