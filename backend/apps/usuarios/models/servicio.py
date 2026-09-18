from django.db import models

from .profesional import Profesional


class Servicio(models.Model):
    profesional = models.ForeignKey(
        Profesional,
        on_delete=models.CASCADE,
        related_name="servicios"
    )

    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    duracion = models.PositiveIntegerField(
        help_text="Duración en minutos"
    )

    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - {self.profesional.nombre_negocio}"
