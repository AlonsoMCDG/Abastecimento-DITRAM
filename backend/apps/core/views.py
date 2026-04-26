import os
import tempfile
from datetime import datetime
from io import StringIO

from django.conf import settings
from django.core.cache import cache
from django.core.management import call_command
from django.core.serializers import deserialize
from django.db import IntegrityError, transaction, connection
from django.http import FileResponse, HttpResponse
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .seed import ensure_superadmin, seed_force


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_superuser", False)
        )


# ==========================================
# Upload de JSON com Correção de PK (e Ignore Duplicates)
# ==========================================
@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def upload_seed_files(request):
    files = request.FILES.getlist("files")
    if not files:
        return Response({"detail": "Nenhum arquivo enviado."}, status=400)

    criados = 0
    ignorados = 0

    try:
        for f in files:
            json_data = f.read().decode('utf-8')
            
            # O deserialize nativo lê a string JSON e resolve as chaves naturais
            for obj_deserializado in deserialize("json", json_data):
                instancia = obj_deserializado.object
                
                try:
                    # Isola o salvamento. Se violar uma constraint (unique), 
                    # faz o rollback só desta linha e vai pro except.
                    with transaction.atomic():
                        instancia.save()
                        criados += 1
                
                except IntegrityError:
                    ignorados += 1
                    continue # Dado já existe, ignora e segue pro próximo

        # Sincronização de Sequência (CRÍTICO para PostgreSQL com JSONs hardcoded)
        # Mantido intacto, pois se novos IDs foram inseridos manualmente, a sequência precisa alinhar
        if connection.vendor in ['postgresql', 'mysql', 'oracle']:
            out = StringIO()
            apps_to_reset = ['organizacao', 'frota', 'pessoas', 'operacao', 'usuarios']
            call_command('sqlsequencereset', *apps_to_reset, stdout=out)
            sql = out.getvalue()
            
            if sql:
                with connection.cursor() as cursor:
                    cursor.execute(sql)

        cache.clear() # Limpa o cache após a inserção dos novos dados


        return Response({
            "detail": f"Upload concluído! {criados} novos registros salvos, {ignorados} já existentes ignorados."
        })

    except Exception as e:
        return Response({"detail": f"Erro ao processar: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def seed_default_data_force(request):
    seed_force(verbosity=0)
    cache.clear() # Limpa o cache após a inserção dos novos dados
    return Response({"detail": "Seed carregado (force)."})


@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def reset_db_and_seed_default_data(request):
    call_command("flush", interactive=False, verbosity=0, allow_cascade=True)
    call_command("migrate", verbosity=0)
    seed_force(verbosity=0)
    cache.clear() # Limpa o cache após a inserção dos novos dados
    return Response({"detail": "Banco resetado e seed carregado."})


@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def flush_db_keep_superadmin(request):
    call_command("flush", interactive=False, verbosity=0, allow_cascade=True)
    ensure_superadmin()
    cache.clear() # Limpa o cache após a inserção dos novos dados
    return Response({"detail": "Banco apagado (mantendo superadmin)."})


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def backup_dumpdata(request):
    out = StringIO()
    call_command(
        "dumpdata",
        "organizacao",
        "frota",
        "pessoas",
        "operacao",
        "usuarios",
        indent=2,
        stdout=out,
        verbosity=0,
    )

    ts = now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_dumpdata_{ts}.json"
    resp = HttpResponse(out.getvalue(), content_type="application/json; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="{filename}"'
    return resp


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def backup_sqlite_db(request):
    engine = settings.DATABASES["default"]["ENGINE"]
    if not engine.endswith("sqlite3"):
        return Response(
            {"detail": "Backup do arquivo do banco só é suportado quando o banco é SQLite."},
            status=400,
        )

    db_path = os.fspath(settings.DATABASES["default"]["NAME"])
    if not os.path.exists(db_path):
        return Response({"detail": "Arquivo do banco SQLite não encontrado."}, status=404)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"db_backup_{ts}.sqlite3"
    return FileResponse(open(db_path, "rb"), as_attachment=True, filename=filename)


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def db_stats(request):
    from apps.organizacao.models import Instituicao, Secretaria
    from apps.frota.models import Rota, Veiculo
    from apps.pessoas.models import Pessoa
    from apps.operacao.models import Guia, OperadorVeiculo, AlocacaoServico, TipoServico
    from django.contrib.auth import get_user_model

    User = get_user_model()
    engine = settings.DATABASES["default"]["ENGINE"]

    return Response(
        {
            "database_engine": engine,
            "is_sqlite": bool(engine.endswith("sqlite3")),
            "counts": {
                "secretarias": Secretaria.objects.count(),
                "instituicoes": Instituicao.objects.count(),
                "rotas": Rota.objects.count(),
                "condutores": Pessoa.objects.count(),
                "veiculos": Veiculo.objects.count(),
                "lotacoes": AlocacaoServico.objects.count(),
                "guias": Guia.objects.count(),
                "usuarios": User.objects.count(),
            },
        }
    )