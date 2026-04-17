from django.core.management.base import BaseCommand
from apps.core.seed import seed_force

class Command(BaseCommand):
    help = "Carrega dados padrão (fixtures) e garante existência do superadmin via Terminal."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Carrega fixtures ignorando verificações.",
        )

    def handle(self, *args, **options):
        verbosity = int(options.get("verbosity", 1))
        
        self.stdout.write("Iniciando carga de dados iniciais...")
        
        # Como o controle agora é manual, a execução via CLI sempre força a carga
        seed_force(verbosity=verbosity)
        
        self.stdout.write(self.style.SUCCESS("Seed executado com sucesso! Dados carregados."))
