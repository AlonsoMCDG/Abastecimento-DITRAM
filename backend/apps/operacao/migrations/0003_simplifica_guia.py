from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('operacao', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guiaabastecimento',
            name='modalidade',
            field=models.CharField(
                max_length=100,
                verbose_name='Tipo de Guia / Operação',
            ),
        ),
        migrations.AlterField(
            model_name='guiaabastecimento',
            name='tipo_atividade',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                to='operacao.tipoatividade',
            ),
        ),
        migrations.AlterField(
            model_name='guiaabastecimento',
            name='tipo_veiculo',
            field=models.CharField(
                blank=True,
                max_length=50,
                null=True,
            ),
        ),
        migrations.RemoveConstraint(
            model_name='guiaabastecimento',
            name='guia_veiculo_fk_ou_dupla_avulsa',
        ),
    ]
