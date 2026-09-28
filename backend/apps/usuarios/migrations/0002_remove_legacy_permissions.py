from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usuario',
            name='can_write_cadastros',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='can_write_frota',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='can_create_guia_abastecimento',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='can_edit_guia_abastecimento',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='can_delete_guia_abastecimento',
        ),
    ]
