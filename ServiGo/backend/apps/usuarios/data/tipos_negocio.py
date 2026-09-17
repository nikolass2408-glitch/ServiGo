from django.db import models


class TipoNegocio(models.TextChoices):
    BARBERIA = "BARBERIA", "Barbería"
    RESTAURANTE = "RESTAURANTE", "Restaurante"
    SPA = "SPA", "Spa"
    GIMNASIO = "GIMNASIO", "Gimnasio"
    FOTOGRAFIA = "FOTOGRAFIA", "Fotografía"
    EDUCACION = "EDUCACION", "Educación"
    MASCOTAS = "MASCOTAS", "Mascotas"
    SALUD = "SALUD", "Salud"
    AUTOMOTRIZ = "AUTOMOTRIZ", "Automotriz"
    OTRO = "OTRO", "Otro"
