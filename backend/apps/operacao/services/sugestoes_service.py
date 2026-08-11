from django.db import models
from apps.operacao.models import GuiaAbastecimento, TipoAtividade
from apps.frota.models import Veiculo

def sugestao_tipo_atividade(pessoa_id):
    tipo_id = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id)
        .values('tipo_atividade')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('tipo_atividade', flat=True)
        .first()
    )
    if not tipo_id: return None
    
    tipo = TipoAtividade.objects.get(id=tipo_id)
    return {"value": tipo.id, "label": tipo.nome}

def veiculo_mais_usado(pessoa_id):
    veiculo_id = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id, veiculo__isnull=False)
        .values('veiculo')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('veiculo', flat=True)
        .first()
    )
    if not veiculo_id: return None
    
    veiculo = Veiculo.objects.get(id=veiculo_id)
    return {"value": veiculo.id, "label": veiculo.placa}

def get_sugestoes_pessoa(pessoa_id):
    return {
        "tipo_atividade": sugestao_tipo_atividade(pessoa_id),
        "veiculo": veiculo_mais_usado(pessoa_id),
    }
