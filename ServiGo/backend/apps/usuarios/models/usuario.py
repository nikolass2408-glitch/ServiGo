from django.contrib.auth.models import AbstractUser
from django.db import models

from ..data.roles import RolUsuario


class Usuario(AbstractUser):
    rol = models.CharField(
        max_length=10,
        choices=RolUsuario.choices,
        default=RolUsuario.CLIENTE
    )

    telefono = models.CharField(
        max_length=20,
        blank=True
    )

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"
