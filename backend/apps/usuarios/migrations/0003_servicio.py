import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_profesional'),
    ]

    operations = [
        migrations.CreateModel(
            name='Servicio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=150)),
                ('descripcion', models.TextField(blank=True)),
                ('precio', models.DecimalField(decimal_places=2, max_digits=10)),
                ('duracion', models.PositiveIntegerField(help_text='Duración en minutos')),
                ('activo', models.BooleanField(default=True)),
                ('profesional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='servicios', to='usuarios.profesional')),
            ],
        ),
    ]
