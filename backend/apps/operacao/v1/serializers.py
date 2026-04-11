from rest_framework import serializers
from apps.operacao.models import OperadorVeiculo, Guia, AlocacaoServico, TipoServico

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoVeiculo, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao


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
    # Relacionamento Pessoa
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    
    # Relacionamento Tipo Servico
    tipo_servico_id = serializers.IntegerField(read_only=True)
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)
    
    # Relacionamento Secretaria (CORRIGIDO: Agora exposto para a listagem)
    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    class Meta:
        model = AlocacaoServico
        fields = [
            'id', 
            'pessoa_id', 'pessoa_nome', 
            'tipo_servico_id', 'tipo_servico_nome', 
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'is_principal'
        ]

class AlocacaoServicoWriteSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    tipo_servico_id = serializers.PrimaryKeyRelatedField(source='tipo_servico', queryset=TipoServico.objects.all())
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all()) # CORRIGIDO

    class Meta:
        model = AlocacaoServico
        fields = ['id', 'pessoa_id', 'tipo_servico_id', 'secretaria_id', 'is_principal']

class AlocacaoServicoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField() # Melhoria para a label do select
    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = AlocacaoServico
        fields = ['value', 'label', 'secretaria_id', 'is_principal']

    def get_label(self, obj):
        # Exibe "João da Silva - Roçagem" no Select do frontend
        return f"{obj.pessoa.nome} - {obj.tipo_servico.nome}"


# --- SERIALIZERS DE OPERADOR DE VEÍCULO ---

class OperadorVeiculoReadSerializer(serializers.ModelSerializer):
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)
    
    veiculo_id = serializers.IntegerField(read_only=True)
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

class OperadorVeiculoLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.ReadOnlyField(source='pessoa.nome')

    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = OperadorVeiculo
        fields = ['value', 'label', 'secretaria_id', 'is_principal']

# --- SERIALIZERS DE GUIA (ABASTECIMENTO) ---

class GuiaReadSerializer(serializers.ModelSerializer):
    # ==========================================
    # TRADUÇÃO DE CHAVES ESTRANGEIRAS PARA O FRONTEND
    # ==========================================
    pessoa_id = serializers.IntegerField(read_only=True)
    pessoa_nome = serializers.CharField(source='pessoa.nome', read_only=True)

    veiculo_id = serializers.IntegerField(read_only=True)
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)

    rota_id = serializers.IntegerField(read_only=True)
    rota_nome = serializers.CharField(source='rota.nome', read_only=True, default=None)

    tipo_servico_id = serializers.IntegerField(read_only=True)
    tipo_servico_nome = serializers.CharField(source='tipo_servico.nome', read_only=True)

    secretaria_id = serializers.IntegerField(read_only=True)
    secretaria_nome = serializers.CharField(source='secretaria.nome', read_only=True)
    secretaria_sigla = serializers.CharField(source='secretaria.sigla', read_only=True)

    instituicao_id = serializers.IntegerField(read_only=True)
    instituicao_nome = serializers.CharField(source='instituicao.nome', read_only=True)

    tipo_veiculo_id = serializers.IntegerField(read_only=True)
    tipo_veiculo_nome = serializers.CharField(source='tipo_veiculo.nome', read_only=True)
    
    tipo_combustivel_id = serializers.IntegerField(read_only=True)
    tipo_combustivel_nome = serializers.CharField(source='tipo_combustivel.nome', read_only=True)

    # Pegando o nome do usuário que emitiu (seguro caso use first_name ou username)
    usuario_id = serializers.IntegerField(read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)

    class Meta:
        model = Guia
        fields = [
            'id', 'data_hora', 'quantidade_combustivel', 'quantidade_oleo', 
            'hodometro_atual', 'hodometro_anterior', 'distancia_percorrida',
            'periodo_uso_dias', 'observacao', 'rota_texto', 'tipo_servico_texto',
            
            # Relacionamentos Mapeados
            'pessoa_id', 'pessoa_nome',
            'veiculo_id', 'veiculo_placa',
            'rota_id', 'rota_nome',
            'tipo_servico_id', 'tipo_servico_nome',
            'secretaria_id', 'secretaria_nome', 'secretaria_sigla',
            'instituicao_id', 'instituicao_nome',
            'tipo_veiculo_id', 'tipo_veiculo_nome',
            'tipo_combustivel_id', 'tipo_combustivel_nome',
            'usuario_id', 'usuario_nome'
        ]


class GuiaWriteSerializer(serializers.ModelSerializer):
    # ==========================================
    # VALIDAÇÃO DE ENTRADA (Mapeando os IDs do Frontend para Instâncias do Model)
    # ==========================================
    pessoa_id = serializers.PrimaryKeyRelatedField(source='pessoa', queryset=Pessoa.objects.all())
    veiculo_id = serializers.PrimaryKeyRelatedField(source='veiculo', queryset=Veiculo.objects.all())
    secretaria_id = serializers.PrimaryKeyRelatedField(source='secretaria', queryset=Secretaria.objects.all())
    instituicao_id = serializers.PrimaryKeyRelatedField(source='instituicao', queryset=Instituicao.objects.all())
    tipo_servico_id = serializers.PrimaryKeyRelatedField(source='tipo_servico', queryset=TipoServico.objects.all())
    tipo_veiculo_id = serializers.PrimaryKeyRelatedField(source='tipo_veiculo', queryset=TipoVeiculo.objects.all())
    tipo_combustivel_id = serializers.PrimaryKeyRelatedField(source='tipo_combustivel', queryset=TipoCombustivel.objects.all())
    
    # Rota é opcional no model (null=True), então o serializer deve refletir isso
    rota_id = serializers.PrimaryKeyRelatedField(
        source='rota', queryset=Rota.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Guia
        fields = [
            'id', 'data_hora', 'quantidade_combustivel', 'quantidade_oleo', 
            'hodometro_atual', 'hodometro_anterior', 'distancia_percorrida', 
            'periodo_uso_dias', 'observacao', 'rota_texto', 'tipo_servico_texto',
            
            # FKs
            'pessoa_id', 'veiculo_id', 'rota_id', 'tipo_servico_id', 
            'secretaria_id', 'instituicao_id', 'tipo_veiculo_id', 'tipo_combustivel_id'
        ]
