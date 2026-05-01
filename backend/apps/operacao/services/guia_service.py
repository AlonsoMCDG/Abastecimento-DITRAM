from apps.operacao.models import TipoAtividade
from apps.operacao.services.tipo_atividade import get_or_create_tipo_atividade

def resolve_tipo_atividade(*, tipo_atividade=None, nome=None):
    if tipo_atividade:
        return tipo_atividade

    if nome:
        tipo, _ = get_or_create_tipo_atividade(nome)
        return tipo

    return None