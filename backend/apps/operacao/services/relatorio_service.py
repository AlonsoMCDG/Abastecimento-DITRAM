from django.db.models import Sum, Count
from django.utils.dateparse import parse_date
from datetime import datetime, date
from decimal import Decimal

from apps.operacao.models import GuiaAbastecimento


def obter_relatorio_consolidado(data_inicio=None, data_fim=None, secretaria_id=None, tipo_combustivel_id=None):
    """
    Gera métricas e consolidados de abastecimento para o período e filtros especificados.
    """
    qs = GuiaAbastecimento.objects.all()

    # Filtros de data
    if data_inicio:
        if isinstance(data_inicio, str):
            d_ini = parse_date(data_inicio)
        elif isinstance(data_inicio, (date, datetime)):
            d_ini = data_inicio
        else:
            d_ini = None
        if d_ini:
            qs = qs.filter(data_hora__date__gte=d_ini)

    if data_fim:
        if isinstance(data_fim, str):
            d_fim = parse_date(data_fim)
        elif isinstance(data_fim, (date, datetime)):
            d_fim = data_fim
        else:
            d_fim = None
        if d_fim:
            qs = qs.filter(data_hora__date__lte=d_fim)

    if secretaria_id:
        qs = qs.filter(secretaria_id=secretaria_id)

    if tipo_combustivel_id:
        qs = qs.filter(tipo_combustivel_id=tipo_combustivel_id)

    # 1. KPIs Gerais
    totais = qs.aggregate(
        total_combustivel=Sum('quantidade_combustivel'),
        total_oleo=Sum('quantidade_oleo'),
        total_guias=Count('id')
    )

    total_combustivel = float(totais['total_combustivel'] or Decimal('0'))
    total_oleo = float(totais['total_oleo'] or Decimal('0'))
    total_guias = totais['total_guias'] or 0

    total_veiculos = (
        qs.filter(veiculo__isnull=False)
        .values('veiculo')
        .distinct()
        .count()
    )

    # 2. Consolidado por Secretaria
    secretarias_agg = (
        qs.values('secretaria_id', 'secretaria__nome', 'secretaria__sigla')
        .annotate(
            total_guias=Count('id'),
            total_combustivel=Sum('quantidade_combustivel'),
            total_oleo=Sum('quantidade_oleo')
        )
        .order_by('-total_combustivel')
    )

    por_secretaria = [
        {
            "secretaria_id": item['secretaria_id'],
            "nome": item['secretaria__nome'],
            "sigla": item['secretaria__sigla'],
            "total_guias": item['total_guias'],
            "total_combustivel": float(item['total_combustivel'] or Decimal('0')),
            "total_oleo": float(item['total_oleo'] or Decimal('0')),
        }
        for item in secretarias_agg
    ]

    # 3. Consolidado por Tipo de Combustível
    combustivel_agg = (
        qs.values('tipo_combustivel_id', 'tipo_combustivel__nome')
        .annotate(
            total_guias=Count('id'),
            total_litros=Sum('quantidade_combustivel')
        )
        .order_by('-total_litros')
    )

    por_tipo_combustivel = [
        {
            "tipo_combustivel_id": item['tipo_combustivel_id'],
            "nome": item['tipo_combustivel__nome'],
            "total_guias": item['total_guias'],
            "total_litros": float(item['total_litros'] or Decimal('0')),
            "percentual": round((float(item['total_litros'] or 0) / total_combustivel * 100), 1) if total_combustivel > 0 else 0
        }
        for item in combustivel_agg
    ]

    # 4. Consolidado por Modalidade
    modalidades_dict = dict(GuiaAbastecimento.MODALIDADE_CHOICES)
    modalidade_agg = (
        qs.values('modalidade')
        .annotate(
            total_guias=Count('id'),
            total_litros=Sum('quantidade_combustivel'),
            total_oleo=Sum('quantidade_oleo')
        )
        .order_by('-total_litros')
    )

    por_modalidade = [
        {
            "modalidade": item['modalidade'],
            "modalidade_nome": modalidades_dict.get(item['modalidade'], item['modalidade']),
            "total_guias": item['total_guias'],
            "total_litros": float(item['total_litros'] or Decimal('0')),
            "total_oleo": float(item['total_oleo'] or Decimal('0')),
            "percentual": round((float(item['total_litros'] or 0) / total_combustivel * 100), 1) if total_combustivel > 0 else 0
        }
        for item in modalidade_agg
    ]

    return {
        "periodo": {
            "data_inicio": str(data_inicio) if data_inicio else None,
            "data_fim": str(data_fim) if data_fim else None,
        },
        "kpis": {
            "total_combustivel": total_combustivel,
            "total_oleo": total_oleo,
            "total_guias": total_guias,
            "total_veiculos": total_veiculos,
        },
        "por_secretaria": por_secretaria,
        "por_tipo_combustivel": por_tipo_combustivel,
        "por_modalidade": por_modalidade,
    }
