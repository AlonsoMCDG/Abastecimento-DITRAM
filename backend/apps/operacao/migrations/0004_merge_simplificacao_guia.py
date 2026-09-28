from django.db import migrations


class Migration(migrations.Migration):
    """Une as duas linhas de migration 0003 existentes na branch."""

    dependencies = [
        ('operacao', '0003_alter_guiaabastecimento_tipo_veiculo'),
        ('operacao', '0003_simplifica_guia'),
    ]

    operations = []
