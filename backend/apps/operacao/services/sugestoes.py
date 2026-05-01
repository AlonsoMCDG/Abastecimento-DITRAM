from django.db import models
from apps.operacao.models import GuiaAbastecimento

def sugestao_tipo_atividade(pessoa):
    tipo = (
        GuiaAbastecimento.objects
        .filter(pessoa=pessoa)
        .values('tipo_atividade')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('tipo_atividade', flat=True)
        .first()
    )
    return {
        "value": tipo.id,
        "label": tipo.nome
    }


def veiculo_mais_usado(pessoa):
    tipo = (
        GuiaAbastecimento.objects
        .filter(pessoa=pessoa, veiculo__isnull=False)
        .values('veiculo')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('veiculo', flat=True)
        .first()
    )
    return {
        "value": tipo.id,
        "label": tipo.nome
    }

def get_sugestoes_pessoa(pessoa):
    return {
        "tipo_atividade": sugestao_tipo_atividade(pessoa),
        "veiculo": veiculo_mais_usado(pessoa),
    }