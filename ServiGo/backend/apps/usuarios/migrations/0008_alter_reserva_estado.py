from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0007_notificacion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reserva',
            name='estado',
            field=models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('CONFIRMADA', 'Confirmada'), ('CANCELADA', 'Cancelada'), ('COMPLETADA', 'Completada'), ('REPROGRAMADA', 'Reprogramada'), ('RECHAZADA', 'Rechazada')], default='PENDIENTE', max_length=20),
        ),
    ]
