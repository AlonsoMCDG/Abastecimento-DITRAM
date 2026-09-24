from django.db import transaction
from django.core.exceptions import ValidationError

from apps.operacao.models import GuiaAbastecimento


def criar_guia(dados: dict, usuario) -> GuiaAbastecimento:
    """Cria uma guia sem exigir automações de preenchimento."""
    _validar_regras_guia(dados)

    with transaction.atomic():
        dados.pop("tipo_atividade_nome", None)

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
    Valida somente o que é necessário para emitir a guia.

    Relações como secretaria -> motorista -> veículo são facilidades
    para preenchimento e serão usadas nos filtros futuros.
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

    hodometro_quebrado = (
        dados.get("hodometro_quebrado")
        if "hodometro_quebrado" in dados
        else (instancia_atual.hodometro_quebrado if instancia_atual else False)
    )

    if hodometro_quebrado:
        dados["hodometro"] = None
