from rest_framework import serializers
from django.db import transaction
from apps.operacao.models import OperadorVeiculo, Guia, AlocacaoServico, TipoServico

from apps.pessoas.models import Pessoa
from apps.frota.models import Veiculo, Rota, TipoVeiculo, TipoCombustivel
from apps.organizacao.models import Secretaria, Instituicao

from decimal import Decimal, InvalidOperation

# --- SERIALIZERS DE TipoServico ---

class TipoServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoServico
        fields = ['id', 'nome', 'ativo']


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


class CreatableInstituicaoField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        if data in [None, '', 'null']:
            return super().to_internal_value(data)
        try:
            int(data)
            return super().to_internal_value(data)
        except (ValueError, TypeError):
            if isinstance(data, str) and data.strip():
                # Cria a instituição apenas com o nome
                instituicao, _ = Instituicao.objects.get_or_create(nome=data.strip())
                return instituicao
            self.fail('incorrect_type', data_type=type(data).__name__)
class CreatableRotaField(serializers.PrimaryKeyRelatedField):
    """
    Campo inteligente: Aceita um ID numérico (opção existente) ou 
    uma String (texto livre). Se for String, cria a Rota automaticamente.
    """
    def to_internal_value(self, data):
        # Ignora nulos e vazios, passando para a validação padrão (allow_null=True)
        if data in [None, '', 'null']:
            return super().to_internal_value(data)
            
        try:
            # TENTATIVA PADRÃO: Verifica se o valor recebido é um ID numérico
            # Se for, deixa o DRF validar se essa rota existe no banco
            int(data)
            return super().to_internal_value(data)
        except (ValueError, TypeError):
            # FALLBACK: Se falhou ao converter para int, é um texto livre (Rota Nova)
            if isinstance(data, str) and data.strip():
                nome_digitado = data.strip()
                
                # Captura o payload completo enviado pelo React
                request = self.context.get('request')
                payload = request.data if request else {}

                # Resolvemos a Instituição antes de configurar os defaults da Rota
                instituicao_raw = payload.get('instituicao_id')
                instituicao_obj = None

                if instituicao_raw:
                    if str(instituicao_raw).isdigit():
                        instituicao_obj = Instituicao.objects.filter(id=instituicao_raw).first()
                    else:
                        # Se for string, cria/recupera agora para ter o objeto pronto
                        instituicao_obj, _ = Instituicao.objects.get_or_create(nome=str(instituicao_raw).strip())

                # Função segura para converter as strings com vírgula do frontend
                def safe_decimal(v):
                    try: return Decimal(str(v).replace(',', '.')) if v else Decimal('0.00')
                    except: return Decimal('0.00')
                
                # Extrai Combustível e Óleo
                qtd_combustivel = safe_decimal(payload.get('quantidade_combustivel'))
                qtd_oleo = safe_decimal(payload.get('quantidade_oleo'))

                # Extrai Hodômetros e calcula a distância
                hodo_atual = safe_decimal(payload.get('hodometro_atual'))
                hodo_anterior = safe_decimal(payload.get('hodometro_anterior'))
                distancia_calculada = max(0, hodo_atual - hodo_anterior)

                # Define os dados padrão (defaults) para quando a rota for NOVA
                defaults = {
                    'consumo_estimado_combustivel': qtd_combustivel,
                    'consumo_estimado_oleo': qtd_oleo,
                    'detalhes': "Rota criada automaticamente na emissão da guia.",
                    'tipo_locomocao': 'TERRESTRE', 
                    'secretaria_id': payload.get('secretaria_id'),
                    'instituicao_id': instituicao_obj,
                }

                # Busca ou Cria a Rota. Se criar, usa os defaults
                nova_rota, created = Rota.objects.get_or_create(
                    nome=nome_digitado,
                    defaults=defaults
                )
                
                # Retorna a instância da Rota para ser salva na Guia
                return nova_rota
            
            # Se for outro tipo de dado bizarro (ex: uma lista ou dict), levanta erro padrão
            self.fail('incorrect_type', data_type=type(data).__name__)

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
    
    rota_id = CreatableRotaField(
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

    @transaction.atomic  # Garante que se o veículo falhar, a guia não é salva (e vice-versa)
    def create(self, validated_data):
        # Salva a Guia de Abastecimento normalmente no banco
        guia = super().create(validated_data)

        # Pega a instância do veículo que acabou de ser vinculado à guia
        veiculo = guia.veiculo

        # Lógica de Atualização do Hodômetro (Com Proteção!)
        hodometro_informado = guia.hodometro_atual
        
        if hodometro_informado:
            # Proteção contra erros de digitação: O hodômetro do veículo só avança, nunca retrocede.
            # Se o carro tem 50.000km e o cara digitou 5.000 na guia por engano, não atualizamos o veículo.
            if hodometro_informado > veiculo.hodometro_atual:
                veiculo.hodometro_atual = hodometro_informado
                # Usamos update_fields para ganhar performance e não re-salvar a placa, modelo, etc.
                veiculo.save(update_fields=['hodometro_atual'])

        return guia