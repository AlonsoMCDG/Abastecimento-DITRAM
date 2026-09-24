from django.db import transaction
from django.core.exceptions import ValidationError
from apps.operacao.models import GuiaAbastecimento
from apps.operacao.services.tipo_atividade_service import get_or_create_tipo_atividade


def criar_guia(dados: dict, usuario) -> GuiaAbastecimento:
    """Cria uma guia sem exigir automações de preenchimento."""
    _validar_regras_guia(dados)

    with transaction.atomic():
        nome_atividade = dados.pop("tipo_atividade_nome", None)

        if not dados.get("tipo_atividade") and nome_atividade:
            tipo_atividade, _ = get_or_create_tipo_atividade(nome_atividade)
            dados["tipo_atividade"] = tipo_atividade

        if dados.get("hodometro_quebrado"):
            dados["hodometro"] = None

        return GuiaAbastecimento.objects.create(usuario=usuario, **dados)


def atualizar_guia(guia: GuiaAbastecimento, dados: dict) -> GuiaAbastecimento:
    """Atualiza uma guia sem exigir automações de preenchimento."""
    _validar_regras_guia(dados, instancia_atual=guia)

    with transaction.atomic():
        dados.pop("tipo_atividade_nome", None)

        if dados.get("hodometro_quebrado"):
            dados["hodometro"] = None

        for attr, value in dados.items():
            setattr(guia, attr, value)

        guia.save()
        return guia


def _validar_regras_guia(dados: dict, instancia_atual=None):
    """
    Valida somente as regras que realmente pertencem à emissão da guia.

    Relacionamentos entre motorista, secretaria, veículo e rota são
    facilidades para preenchimento e não pré-requisitos para salvar.
    """
    veiculo = dados.get("veiculo") if "veiculo" in dados else (
        instancia_atual.veiculo if instancia_atual else None
    )
    descricao = dados.get("veiculo_descricao") if "veiculo_descricao" in dados else (
        instancia_atual.veiculo_descricao if instancia_atual else None
    )

    if not veiculo and not descricao:
        raise ValidationError({
            "veiculo": "Informe o veículo ou o equipamento/recurso abastecido."
        })

    if dados.get("tipo_atividade") and dados.get("tipo_atividade_nome"):
        raise ValidationError({
            "tipo_atividade": "Informe a atividade por referência ou por nome, não as duas."
        })
