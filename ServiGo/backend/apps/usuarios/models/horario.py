from django.db import models

from ..data.dias_semana import DiaSemana
from .profesional import Profesional


class Horario(models.Model):
    profesional = models.ForeignKey(
        Profesional,
        on_delete=models.CASCADE,
        related_name="horarios"
    )

    dia = models.IntegerField(
        choices=DiaSemana.choices
    )

    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.profesional.nombre_negocio} - {self.get_dia_display()}"
