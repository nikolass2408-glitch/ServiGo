import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_servicio'),
    ]

    operations = [
        migrations.CreateModel(
            name='Horario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dia', models.IntegerField(choices=[(0, 'Lunes'), (1, 'Martes'), (2, 'Miércoles'), (3, 'Jueves'), (4, 'Viernes'), (5, 'Sábado'), (6, 'Domingo')])),
                ('hora_inicio', models.TimeField()),
                ('hora_fin', models.TimeField()),
                ('activo', models.BooleanField(default=True)),
                ('profesional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='horarios', to='usuarios.profesional')),
            ],
        ),
    ]
