from rapidfuzz import process, fuzz
from apps.operacao.models import TipoAtividade


def normalize(nome: str):
    return " ".join(nome.split()).title().strip()


def get_or_create_tipo_atividade(nome: str):
    nome = normalize(nome)

    qs = TipoAtividade.objects.only("id", "nome")
    nomes = list(qs.values_list("nome", flat=True))

    match = process.extractOne(nome, nomes, scorer=fuzz.WRatio)

    if match and match[1] >= 85:
        return qs.get(nome=match[0]), False

    return TipoAtividade.objects.get_or_create(nome=nome)
