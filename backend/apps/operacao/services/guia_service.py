from django.db import transaction
from django.core.exceptions import ValidationError
from apps.operacao.models import GuiaAbastecimento
from apps.frota.models import Rota
from apps.operacao.services.tipo_atividade_service import get_or_create_tipo_atividade

def criar_guia(dados: dict, usuario) -> GuiaAbastecimento:
    """Aplica as regras de negócio e cria uma Guia de Abastecimento."""
    
    _validar_regras_guia(dados)

    with transaction.atomic():
        # 1. Resolução do Tipo de Atividade
        tipo_atividade_obj = dados.get("tipo_atividade")
        nome_atividade = dados.pop("tipo_atividade_nome", None)
        
        if not tipo_atividade_obj and nome_atividade:
            tipo_atividade_obj, _ = get_or_create_tipo_atividade(nome_atividade)
            
        dados["tipo_atividade"] = tipo_atividade_obj

        # 2. Resolução de Rota Manual
        rota_manual = dados.get("rota_manual")
        rota = dados.get("rota")
        secretaria = dados.get("secretaria")

        if rota_manual and not rota and secretaria:
            nova_rota, _ = Rota.objects.get_or_create(
                nome=rota_manual.strip().title(),
                secretaria=secretaria
            )
            dados["rota"] = nova_rota
            dados["rota_manual"] = None

        # 3. Ajuste do Hodômetro Quebrado
        if dados.get("hodometro_quebrado"):
            dados["hodometro"] = None

        guia = GuiaAbastecimento.objects.create(usuario=usuario, **dados)
        return guia

def atualizar_guia(guia: GuiaAbastecimento, dados: dict) -> GuiaAbastecimento:
    """Atualiza uma guia existente aplicando as regras de negócio."""
    _validar_regras_guia(dados, instancia_atual=guia)
    
    with transaction.atomic():
        for attr, value in dados.items():
            setattr(guia, attr, value)
        guia.save()
        return guia

def _validar_regras_guia(dados: dict, instancia_atual=None):
    # Merge com dados atuais em caso de partial update
    modalidade = dados.get("modalidade") or (instancia_atual.modalidade if instancia_atual else None)
    veiculo = dados.get("veiculo") if "veiculo" in dados else (instancia_atual.veiculo if instancia_atual else None)
    tipo = dados.get("tipo_veiculo") if "tipo_veiculo" in dados else (instancia_atual.tipo_veiculo if instancia_atual else None)
    desc = dados.get("veiculo_descricao") if "veiculo_descricao" in dados else (instancia_atual.veiculo_descricao if instancia_atual else None)
    
    rota = dados.get("rota") if "rota" in dados else (instancia_atual.rota if instancia_atual else None)
    secretaria = dados.get("secretaria") if "secretaria" in dados else (instancia_atual.secretaria if instancia_atual else None)
    
    tipo_atividade = dados.get("tipo_atividade") or (instancia_atual.tipo_atividade if instancia_atual else None)
    tipo_atividade_nome = dados.get("tipo_atividade_nome")

    # Regra do Veículo
    if veiculo:
        if tipo or desc:
            raise ValidationError({"veiculo": "Se informar o veículo cadastrado, não envie categoria ou descrição."})
    else:
        if not tipo or not desc:
            raise ValidationError({"veiculo_descricao": "Para veículos avulsos ou embarcações, informe obrigatoriamente a descrição e a categoria."})

    # Regra da Atividade
    if not tipo_atividade and not tipo_atividade_nome:
        if modalidade in ['COROTE', 'CARRO_PASSEIO']:
            raise ValidationError({"tipo_atividade": f"Para a modalidade {modalidade}, o campo de serviço é estritamente obrigatório."})
        raise ValidationError({"tipo_atividade": "Informe tipo_atividade ou tipo_atividade_nome."})

    if tipo_atividade and tipo_atividade_nome:
        raise ValidationError({"tipo_atividade": "Informe apenas a referência da atividade OU o nome, não ambos."})
