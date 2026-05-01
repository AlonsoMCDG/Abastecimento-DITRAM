from rest_framework import serializers
from django.db import transaction
from apps.operacao.models import (
    TipoAtividade, GuiaAbastecimento, RegistroHodometroDiario
)

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao
from apps.operacao.services.sugestoes import get_sugestoes_pessoa

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
# SERIALIZERS DE GUIA DE ABASTECIMENTO
# ==========================================
class GuiaReadSerializer(serializers.ModelSerializer):
    modalidade_nome = serializers.CharField(source='get_modalidade_display', read_only=True)
    
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)

    veiculo_display = serializers.CharField(source='veiculo_display', read_only=True)

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
            'quantidade_combustivel', 'quantidade_oleo', 'periodo_uso_dias', 
            'observacao', 'rota_manual', 'veiculo_display',
            
            # FKs Mapeadas
            'pessoa_id', 'pessoa_nome',
            'rota_id', 'rota_nome',
            'tipo_atividade_id', 'tipo_atividade_nome',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'instituicao_id', 'instituicao_nome',
            'tipo_combustivel_id', 'tipo_combustivel_nome',
            'usuario_id', 'usuario_nome',
            
            'criado_em', 'atualizado_em'
        ]

class GuiaWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(
        source='pessoa',
        queryset=Pessoa.objects.all()
    )

    veiculo_id = serializers.PrimaryKeyRelatedField(
        source='veiculo',
        queryset=Veiculo.objects.all(),
        required=False,
        allow_null=True
    )

    secretaria_id = serializers.PrimaryKeyRelatedField(
        source='secretaria',
        queryset=Secretaria.objects.all()
    )

    instituicao_id = serializers.PrimaryKeyRelatedField(
        source='instituicao',
        queryset=Instituicao.objects.all(),
        required=False,
        allow_null=True
    )

    tipo_combustivel_id = serializers.PrimaryKeyRelatedField(
        source='tipo_combustivel',
        queryset=TipoCombustivel.objects.all()
    )

    rota_id = serializers.PrimaryKeyRelatedField(
        source='rota',
        queryset=Rota.objects.all(),
        required=False,
        allow_null=True
    )

    tipo_atividade_id = serializers.PrimaryKeyRelatedField(
        source='tipo_atividade',
        queryset=TipoAtividade.objects.all(),
        required=False,
        allow_null=True
    )

    tipo_atividade_nome = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = GuiaAbastecimento
        fields = [
            'id', 'data_hora', 'modalidade', 'quantidade_combustivel',
            'quantidade_oleo', 'periodo_uso_dias', 'observacao',
            'rota_manual',

            'pessoa_id',
            'veiculo_id',
            'tipo_veiculo',
            'veiculo_descricao',

            'tipo_atividade_id',
            'tipo_atividade_nome',

            'rota_id',
            'secretaria_id',
            'instituicao_id',
            'tipo_combustivel_id'
        ]

    def validate(self, data):
        # -------------------------
        # Regra do veículo (XOR)
        # -------------------------
        veiculo = bool(data.get("veiculo"))
        tipo = bool(data.get("tipo_veiculo"))
        desc = bool(data.get("veiculo_descricao"))

        if sum([veiculo, tipo, desc]) != 1:
            raise serializers.ValidationError(
                "Informe apenas um: veículo cadastrado, tipo de veículo ou descrição."
            )

        # -------------------------
        # Regra da atividade (OU)
        # -------------------------
        tipo_atividade = data.get("tipo_atividade")
        nome = self.initial_data.get("tipo_atividade_nome")

        if not tipo_atividade and not nome:
            raise serializers.ValidationError(
                "Informe tipo_atividade_id ou tipo_atividade_nome."
            )

        if tipo_atividade and nome:
            raise serializers.ValidationError(
                "Informe apenas tipo_atividade_id OU tipo_atividade_nome."
            )

        return data

    def create(self, validated_data):
        from apps.operacao.services.guia_service import resolve_tipo_atividade

        nome = validated_data.pop("tipo_atividade_nome", None)
        tipo_obj = validated_data.get("tipo_atividade")

        tipo_atividade_obj = resolve_tipo_atividade(
            tipo_atividade=tipo_obj,
            nome=nome
        )

        if not tipo_atividade_obj:
            raise serializers.ValidationError(
                "Informe tipo_atividade_id ou tipo_atividade_nome."
            )

        validated_data["tipo_atividade"] = tipo_atividade_obj

        return super().create(validated_data)


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
