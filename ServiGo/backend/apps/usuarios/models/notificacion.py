from django.db import models

from ..data.tipos_notificacion import TipoNotificacion
from .reserva import Reserva
from .usuario import Usuario


class Notificacion(models.Model):
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="notificaciones"
    )

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name="notificaciones",
        null=True,
        blank=True
    )

    tipo = models.CharField(
        max_length=30,
        choices=TipoNotificacion.choices
    )

    mensaje = models.TextField()

    leida = models.BooleanField(default=False)

    creada_en = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.usuario.username} - {self.tipo}"
