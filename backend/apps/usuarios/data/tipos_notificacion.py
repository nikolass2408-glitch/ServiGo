from django.db import models


class TipoNotificacion(models.TextChoices):
    NUEVA_RESERVA = "NUEVA_RESERVA", "Nueva reserva"
    CONFIRMACION = "CONFIRMACION", "Reserva confirmada"
    CANCELACION = "CANCELACION", "Reserva cancelada"
    REPROGRAMACION = "REPROGRAMACION", "Reserva reprogramada"
    RECORDATORIO = "RECORDATORIO", "Recordatorio"
