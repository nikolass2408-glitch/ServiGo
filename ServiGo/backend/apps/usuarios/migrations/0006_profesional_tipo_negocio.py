from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0005_reserva'),
    ]

    operations = [
        migrations.AddField(
            model_name='profesional',
            name='tipo_negocio',
            field=models.CharField(
                choices=[
                    ('BARBERIA', 'Barbería'), 
                    ('RESTAURANTE', 'Restaurante'), 
                    ('SPA', 'Spa'), 
                    ('GIMNASIO', 'Gimnasio'), 
                    ('FOTOGRAFIA', 'Fotografía'), 
                    ('EDUCACION', 'Educación'), 
                    ('MASCOTAS', 'Mascotas'), 
                    ('SALUD', 'Salud'), 
                    ('AUTOMOTRIZ', 'Automotriz'), 
                    ('OTRO', 'Otro')], 
                    default='OTRO', max_length=20),
        ),
    ]
