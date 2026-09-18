from django.db import models

from ..data.estados_reserva import EstadoReserva
from .profesional import Profesional
from .servicio import Servicio
from .usuario import Usuario


class Reserva(models.Model):
    profesional = models.ForeignKey(
        Profesional,
        on_delete=models.CASCADE,
        related_name="reservas"
    )

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE,
        related_name="reservas"
    )

    cliente = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="reservas"
    )

    fecha = models.DateField()
    hora = models.TimeField()

    estado = models.CharField(
        max_length=20,
        choices=EstadoReserva.choices,
        default=EstadoReserva.PENDIENTE
    )

    notas = models.TextField(blank=True)

    creada_en = models.DateTimeField(
        auto_now_add=True
    )

    actualizada_en = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.cliente.username} - "
            f"{self.servicio.nombre} - "
            f"{self.fecha}"
        )
