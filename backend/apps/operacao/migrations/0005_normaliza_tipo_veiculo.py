from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('operacao', '0004_merge_simplificacao_guia'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guiaabastecimento',
            name='tipo_veiculo',
            field=models.CharField(
                blank=True,
                max_length=50,
                null=True,
            ),
        ),
    ]
