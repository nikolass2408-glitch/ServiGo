import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0004_horario'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reserva',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField()),
                ('hora', models.TimeField()),
                ('estado', models.CharField(choices=[('PENDIENTE', 'Pendiente'), ('CONFIRMADA', 'Confirmada'), ('CANCELADA', 'Cancelada'), ('COMPLETADA', 'Completada'), ('REPROGRAMADA', 'Reprogramada')], default='PENDIENTE', max_length=20)),
                ('notas', models.TextField(blank=True)),
                ('creada_en', models.DateTimeField(auto_now_add=True)),
                ('actualizada_en', models.DateTimeField(auto_now=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservas', to=settings.AUTH_USER_MODEL)),
                ('profesional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservas', to='usuarios.profesional')),
                ('servicio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservas', to='usuarios.servicio')),
            ],
        ),
    ]
