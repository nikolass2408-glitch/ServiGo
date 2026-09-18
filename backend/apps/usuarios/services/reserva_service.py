from datetime import datetime

from django.utils import timezone

from ..models import Reserva, Notificacion
from ..data.estados_reserva import EstadoReserva
from ..data.tipos_notificacion import TipoNotificacion
from ..repositories.reserva_repository import ReservaRepository
from ..repositories.horario_repository import HorarioRepository
from ..repositories.notificacion_repository import NotificacionRepository
from .exceptions import ReglaNegocioError


class ReservaService:

    @staticmethod
    def crear(serializer):
        """El serializer ya validó las reglas de creación
        (horario disponible, sin duplicados, etc). Aquí solo
        se guarda y se dispara el efecto secundario: notificar."""
        reserva = serializer.save()

        NotificacionRepository.crear(
            usuario=reserva.profesional.usuario,
            reserva=reserva,
            tipo=TipoNotificacion.NUEVA_RESERVA,
            mensaje=(
                f"Nueva reserva de {reserva.cliente.username} "
                f"para el {reserva.fecha} a las {reserva.hora}."
            )
        )

        return reserva

    @staticmethod
    def confirmar(reserva_id):
        reserva = ReservaRepository.buscar_por_id(reserva_id)

        if reserva.estado != EstadoReserva.PENDIENTE:
            raise ReglaNegocioError(
                "Solo se pueden confirmar reservas pendientes."
            )

        reserva.estado = EstadoReserva.CONFIRMADA
        reserva.save()

        NotificacionRepository.crear(
            usuario=reserva.cliente,
            reserva=reserva,
            tipo=TipoNotificacion.CONFIRMACION,
            mensaje=(
                f"Tu reserva para {reserva.servicio.nombre} "
                f"el {reserva.fecha} a las {reserva.hora} "
                f"ha sido confirmada."
            )
        )

        return reserva

    @staticmethod
    def cancelar(reserva_id):
        reserva = ReservaRepository.buscar_por_id(reserva_id)

        if reserva.estado in [
            EstadoReserva.CANCELADA,
            EstadoReserva.COMPLETADA,
        ]:
            raise ReglaNegocioError(
                "Esta reserva no se puede cancelar."
            )

        reserva.estado = EstadoReserva.CANCELADA
        reserva.save()

        NotificacionRepository.crear(
            usuario=reserva.cliente,
            reserva=reserva,
            tipo=TipoNotificacion.CANCELACION,
            mensaje=(
                f"Tu reserva para {reserva.servicio.nombre} "
                f"el {reserva.fecha} a las {reserva.hora} "
                f"ha sido cancelada."
            )
        )

        return reserva

    @staticmethod
    def rechazar(reserva_id):
        reserva = ReservaRepository.buscar_por_id(reserva_id)

        if reserva.estado != EstadoReserva.PENDIENTE:
            raise ReglaNegocioError(
                "Solo se pueden rechazar reservas pendientes."
            )

        reserva.estado = EstadoReserva.RECHAZADA
        reserva.save()

        return reserva

    @staticmethod
    def reprogramar(reserva_id, nueva_fecha_str, nueva_hora_str):
        reserva = ReservaRepository.buscar_por_id(reserva_id)

        if reserva.estado == EstadoReserva.CANCELADA:
            raise ReglaNegocioError(
                "No se puede reprogramar una reserva cancelada."
            )

        if reserva.estado == EstadoReserva.COMPLETADA:
            raise ReglaNegocioError(
                "No se puede reprogramar una reserva completada."
            )

        if not nueva_fecha_str or not nueva_hora_str:
            raise ReglaNegocioError(
                "Debes enviar una nueva fecha y una nueva hora."
            )

        try:
            fecha = datetime.strptime(nueva_fecha_str, "%Y-%m-%d").date()
            hora = datetime.strptime(nueva_hora_str, "%H:%M:%S").time()
        except ValueError:
            raise ReglaNegocioError(
                "La fecha debe ser YYYY-MM-DD y la hora HH:MM:SS."
            )

        if fecha < timezone.localdate():
            raise ReglaNegocioError(
                "No puedes reprogramar para una fecha pasada."
            )

        profesional = reserva.profesional
        horarios = HorarioRepository.activos_por_dia(
            profesional.id, fecha.weekday()
        )

        if not horarios.exists():
            raise ReglaNegocioError(
                "El profesional no tiene horario disponible para ese día."
            )

        horario_valido = HorarioRepository.existe_horario_valido(
            profesional.id, fecha.weekday(), hora
        )

        if not horario_valido:
            raise ReglaNegocioError(
                "La nueva hora está fuera del horario de atención."
            )

        if ReservaRepository.existe_conflicto(
            profesional.id, fecha, hora, excluir_id=reserva.id
        ):
            raise ReglaNegocioError(
                "El nuevo horario ya está reservado."
            )

        reserva.fecha = fecha
        reserva.hora = hora
        reserva.estado = EstadoReserva.REPROGRAMADA
        reserva.save()

        NotificacionRepository.crear(
            usuario=reserva.cliente,
            reserva=reserva,
            tipo=TipoNotificacion.REPROGRAMACION,
            mensaje=(
                f"Tu reserva para {reserva.servicio.nombre} "
                f"ha sido reprogramada para el {reserva.fecha} "
                f"a las {reserva.hora}."
            )
        )

        return reserva

    @staticmethod
    def disponibilidad(profesional_id, fecha_str):
        if not profesional_id or not fecha_str:
            raise ReglaNegocioError(
                "Debes enviar profesional y fecha."
            )

        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            raise ReglaNegocioError(
                "La fecha debe tener el formato YYYY-MM-DD."
            )

        horarios = HorarioRepository.activos_por_dia(
            profesional_id, fecha.weekday()
        )

        reservas = ReservaRepository.del_dia_excluyendo_canceladas(
            profesional_id, fecha
        )

        horas_ocupadas = [
            reserva.hora.strftime("%H:%M:%S")
            for reserva in reservas
        ]

        return {
            "profesional": profesional_id,
            "fecha": str(fecha),
            "horarios": [
                {
                    "hora_inicio": horario.hora_inicio,
                    "hora_fin": horario.hora_fin
                }
                for horario in horarios
            ],
            "horas_ocupadas": horas_ocupadas
        }
