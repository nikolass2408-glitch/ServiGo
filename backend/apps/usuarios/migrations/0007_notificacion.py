import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0006_profesional_tipo_negocio'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('NUEVA_RESERVA', 'Nueva reserva'), ('CONFIRMACION', 'Reserva confirmada'), ('CANCELACION', 'Reserva cancelada'), ('REPROGRAMACION', 'Reserva reprogramada'), ('RECORDATORIO', 'Recordatorio')], max_length=30)),
                ('mensaje', models.TextField()),
                ('leida', models.BooleanField(default=False)),
                ('creada_en', models.DateTimeField(auto_now_add=True)),
                ('reserva', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to='usuarios.reserva')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
