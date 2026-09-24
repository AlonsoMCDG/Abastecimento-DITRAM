from django.db import models
from apps.operacao.models import GuiaAbastecimento, TipoAtividade
from apps.frota.models import Veiculo, Rota
from apps.organizacao.models import Secretaria

def sugestao_tipo_atividade(pessoa_id):
    tipo_id = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id, tipo_atividade__isnull=False)
        .values('tipo_atividade')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('tipo_atividade', flat=True)
        .first()
    )
    if not tipo_id:
        return None
    
    tipo = TipoAtividade.objects.filter(id=tipo_id, ativo=True).first()
    if not tipo:
        return None
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
    if not veiculo_id:
        return None
    
    veiculo = Veiculo.objects.filter(id=veiculo_id, ativo=True).first()
    if not veiculo:
        return None
    return {
        "value": veiculo.id,
        "label": f"{veiculo.modelo} ({veiculo.placa})",
        "tipo_combustivel_id": veiculo.tipo_combustivel_id,
        "consumo_estimado_combustivel": float(veiculo.consumo_estimado_combustivel) if veiculo.consumo_estimado_combustivel else None,
        "unidade_consumo": veiculo.unidade_consumo,
        "hodometro_atual": float(veiculo.hodometro_atual) if veiculo.hodometro_atual else None,
    }

def sugestao_secretaria(pessoa_id):
    sec_id = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id, secretaria__isnull=False)
        .values('secretaria')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('secretaria', flat=True)
        .first()
    )
    if not sec_id:
        return None
    
    sec = Secretaria.objects.filter(id=sec_id, ativo=True).first()
    if not sec:
        return None
    return {"value": sec.id, "label": sec.nome, "sigla": sec.sigla}

def sugestao_modalidade(pessoa_id):
    modalidade = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id)
        .values('modalidade')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('modalidade', flat=True)
        .first()
    )
    return modalidade or None

def sugestao_rota(pessoa_id):
    rota_id = (
        GuiaAbastecimento.objects
        .filter(pessoa_id=pessoa_id, rota__isnull=False)
        .values('rota')
        .annotate(total=models.Count('id'))
        .order_by('-total')
        .values_list('rota', flat=True)
        .first()
    )
    if not rota_id:
        return None
    
    rota = Rota.objects.filter(id=rota_id, ativa=True).first()
    if not rota:
        return None
    return {
        "value": rota.id,
        "label": rota.nome,
        "distancia_km": float(rota.distancia_km) if rota.distancia_km else None,
    }

def get_sugestoes_pessoa(pessoa_id):
    return {
        "tipo_atividade": sugestao_tipo_atividade(pessoa_id),
        "veiculo": veiculo_mais_usado(pessoa_id),
        "secretaria": sugestao_secretaria(pessoa_id),
        "modalidade": sugestao_modalidade(pessoa_id),
        "rota": sugestao_rota(pessoa_id),
    }

