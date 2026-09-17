from ..models import Reserva
from ..data.estados_reserva import EstadoReserva
from ..repositories.reserva_repository import ReservaRepository
from ..repositories.servicio_repository import ServicioRepository


class ReporteService:

    @staticmethod
    def resumen_reservas(profesional_id):
        reservas = ReservaRepository.por_profesional(profesional_id)

        return {
            "total": reservas.count(),
            "pendientes": reservas.filter(
                estado=EstadoReserva.PENDIENTE
            ).count(),
            "confirmadas": reservas.filter(
                estado=EstadoReserva.CONFIRMADA
            ).count(),
            "canceladas": reservas.filter(
                estado=EstadoReserva.CANCELADA
            ).count(),
            "reprogramadas": reservas.filter(
                estado=EstadoReserva.REPROGRAMADA
            ).count(),
            "completadas": reservas.filter(
                estado=EstadoReserva.COMPLETADA
            ).count(),
            "rechazadas": reservas.filter(
                estado=EstadoReserva.RECHAZADA
            ).count(),
        }

    @staticmethod
    def servicios_mas_solicitados(profesional_id):
        servicios = ServicioRepository.de_profesional(profesional_id)

        resultado = []

        for servicio in servicios:
            cantidad = ReservaRepository.por_profesional(
                profesional_id
            ).filter(
                servicio=servicio
            ).exclude(
                estado=EstadoReserva.CANCELADA
            ).exclude(
                estado=EstadoReserva.RECHAZADA
            ).count()

            resultado.append({
                "servicio": servicio.id,
                "nombre": servicio.nombre,
                "reservas": cantidad
            })

        resultado.sort(key=lambda x: x["reservas"], reverse=True)

        return resultado

    @staticmethod
    def citas_completadas(profesional_id):
        reservas = ReservaRepository.completadas_ordenadas(profesional_id)

        return {
            "profesional": profesional_id,
            "total_completadas": reservas.count(),
            "reservas": reservas,
        }

    @staticmethod
    def ingresos_estimados(profesional_id):
        reservas = ReservaRepository.completadas_con_servicio(profesional_id)

        total = sum(reserva.servicio.precio for reserva in reservas)

        return {
            "profesional": profesional_id,
            "citas_completadas": reservas.count(),
            "ingresos_estimados": total
        }
