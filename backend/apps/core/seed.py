from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import transaction

DEFAULT_SUPERADMIN_CPF = "99999999999"
DEFAULT_SUPERADMIN_PASSWORD = "admin"
DEFAULT_FIXTURE_NAME = "default_data"

@transaction.atomic
def ensure_superadmin(
    cpf: str = DEFAULT_SUPERADMIN_CPF,
    password: str = DEFAULT_SUPERADMIN_PASSWORD,
):
    User = get_user_model()
    if User.objects.filter(cpf=cpf).exists():
        return

    # Delega a criação para o seu manager customizado no models.py
    User.objects.create_superuser(
        cpf=cpf,
        password=password,
        first_name="Super",
        last_name="Admin",
        can_write_cadastros=True,
        can_write_frota=True,
        can_create_guia_abastecimento=True,
        can_edit_guia_abastecimento=True,
        can_delete_guia_abastecimento=True,
    )

def load_default_data(fixture_name: str = DEFAULT_FIXTURE_NAME, verbosity: int = 1):
    try:
        call_command(
            "loaddata",
            fixture_name,
            verbosity=verbosity,
        )
    except Exception as e:
        import traceback

        traceback.print_exc()

        raise

def seed_if_empty(verbosity: int = 1):
    # CORREÇÃO: Desativado propositalmente!
    # Isso impede que o Django recarregue os dados "escondido" após um comando flush.
    # O controle de seed agora é 100% manual via interface (Database Danger Page).
    return False

def seed_force(verbosity: int = 1):
    print("[SEED] 1. Iniciando carregamento dos dados padrão")
    load_default_data(verbosity=verbosity)
    print("[SEED] 2. Garantindo superadmin")
    ensure_superadmin()
    print("[SEED] 3. Dados carregados com sucesso")