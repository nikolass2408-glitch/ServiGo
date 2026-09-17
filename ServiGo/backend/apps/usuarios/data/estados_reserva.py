from django.db import models


class EstadoReserva(models.TextChoices):
    PENDIENTE = "PENDIENTE", "Pendiente"
    CONFIRMADA = "CONFIRMADA", "Confirmada"
    CANCELADA = "CANCELADA", "Cancelada"
    COMPLETADA = "COMPLETADA", "Completada"
    REPROGRAMADA = "REPROGRAMADA", "Reprogramada"
    RECHAZADA = "RECHAZADA", "Rechazada"
