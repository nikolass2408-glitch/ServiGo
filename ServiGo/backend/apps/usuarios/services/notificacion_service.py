from ..models import Reserva, Notificacion
from ..data.estados_reserva import EstadoReserva
from ..data.tipos_notificacion import TipoNotificacion
from ..repositories.reserva_repository import ReservaRepository
from ..repositories.notificacion_repository import NotificacionRepository
from .exceptions import ReglaNegocioError


class NotificacionService:

    @staticmethod
    def enviar_recordatorio(reserva_id):
        try:
            reserva = ReservaRepository.buscar_por_id(reserva_id)
        except Reserva.DoesNotExist:
            raise ReglaNegocioError(
                "La reserva no existe.",
                status_code=404
            )

        if reserva.estado in [
            EstadoReserva.CANCELADA,
            EstadoReserva.RECHAZADA,
            EstadoReserva.COMPLETADA,
        ]:
            raise ReglaNegocioError(
                "Esta reserva no puede recibir recordatorio."
            )

        NotificacionRepository.crear(
            usuario=reserva.cliente,
            reserva=reserva,
            tipo=TipoNotificacion.RECORDATORIO,
            mensaje=(
                f"Recordatorio: tienes una reserva para "
                f"{reserva.servicio.nombre} el {reserva.fecha} "
                f"a las {reserva.hora}."
            )
        )

        return reserva
