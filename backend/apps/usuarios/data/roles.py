from django.db import models


class RolUsuario(models.TextChoices):
    ADMINISTRADOR = "ADMIN", "Administrador"
    PROFESIONAL = "PRO", "Profesional"
    CLIENTE = "CLI", "Cliente"
