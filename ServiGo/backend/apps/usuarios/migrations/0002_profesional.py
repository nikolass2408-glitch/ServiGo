import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profesional',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_negocio', models.CharField(max_length=150)),
                ('descripcion', models.TextField(blank=True)),
                ('telefono', models.CharField(blank=True, max_length=20)),
                ('direccion', models.CharField(blank=True, max_length=200)),
                ('imagen', models.URLField(blank=True)),
                ('enlace_personalizado', models.SlugField(max_length=100, unique=True)),
                ('activo', models.BooleanField(default=True)),
                ('usuario', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profesional', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
