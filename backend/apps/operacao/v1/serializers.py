from rest_framework import serializers
from apps.operacao.models import TipoAtividade, GuiaAbastecimento, RegistroHodometroDiario
from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao

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

class GuiaReadSerializer(serializers.ModelSerializer):
    modalidade_nome = serializers.CharField(source='get_modalidade_display', read_only=True)
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    veiculo_id = serializers.IntegerField(read_only=True)
    veiculo_display = serializers.CharField(read_only=True)
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
            'hodometro', 'hodometro_quebrado', 'observacao', 'rota_manual', 
            'veiculo_id', 'veiculo_display', 'tipo_veiculo',
            'pessoa_id', 'pessoa_nome', 'rota_id', 'rota_nome',
            'tipo_atividade_id', 'tipo_atividade_nome',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'instituicao_id', 'instituicao_nome',
            'tipo_combustivel_id', 'tipo_combustivel_nome',
            'usuario_id', 'usuario_nome', 'criado_em', 'atualizado_em'
        ]

class GuiaWriteSerializer(serializers.ModelSerializer):
    # Campo virtual utilizado pelo Service para localizar/criar
    # uma atividade pelo nome.
    tipo_atividade_nome = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True
    )

    class Meta:
        model = GuiaAbastecimento
        fields = [
            'id', 
            'data_hora', 
            'modalidade', 

            'quantidade_combustivel',
            'quantidade_oleo', 
            'periodo_uso_dias', 
            'observacao',

            'hodometro', 
            'hodometro_quebrado', 

            'rota_manual',

            'pessoa', 

            'veiculo', 
            'tipo_veiculo', 
            'veiculo_descricao',

            'tipo_atividade', 
            'tipo_atividade_nome', 

            'rota',

            'secretaria', 
            'instituicao', 
            'tipo_combustivel',
        ]

class RegistroHodometroDiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroHodometroDiario
        fields = [
            'id', 'guia', 'data_referencia', 
            'hodometro_inicial', 'hodometro_final', 'distancia_percorrida'
        ]
        read_only_fields = ['distancia_percorrida']
