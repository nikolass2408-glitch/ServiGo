from ..data.estados_reserva import EstadoReserva
from ..models import Reserva


class ReservaRepository:

    @staticmethod
    def listar_todas():
        return Reserva.objects.all()

    @staticmethod
    def buscar_por_id(reserva_id):
        return Reserva.objects.get(pk=reserva_id)

    @staticmethod
    def historial_ordenado():
        return Reserva.objects.all().order_by("-fecha", "-hora")

    @staticmethod
    def por_profesional(profesional_id):
        return Reserva.objects.filter(profesional_id=profesional_id)

    @staticmethod
    def de_cliente_con_profesional(cliente_id, profesional_id):
        return Reserva.objects.filter(
            cliente_id=cliente_id,
            profesional_id=profesional_id
        ).order_by("-fecha", "-hora")

    @staticmethod
    def existe_conflicto(profesional_id, fecha, hora, excluir_id=None):
        qs = Reserva.objects.filter(
            profesional_id=profesional_id,
            fecha=fecha,
            hora=hora
        ).exclude(estado=EstadoReserva.CANCELADA)

        if excluir_id is not None:
            qs = qs.exclude(id=excluir_id)

        return qs.exists()

    @staticmethod
    def del_dia_excluyendo_canceladas(profesional_id, fecha):
        return Reserva.objects.filter(
            profesional_id=profesional_id,
            fecha=fecha
        ).exclude(estado=EstadoReserva.CANCELADA)

    @staticmethod
    def por_profesional_y_estado(profesional_id, estado):
        return Reserva.objects.filter(
            profesional_id=profesional_id,
            estado=estado
        )

    @staticmethod
    def completadas_con_servicio(profesional_id):
        return Reserva.objects.filter(
            profesional_id=profesional_id,
            estado=EstadoReserva.COMPLETADA
        ).select_related("servicio")

    @staticmethod
    def completadas_ordenadas(profesional_id):
        return Reserva.objects.filter(
            profesional_id=profesional_id,
            estado=EstadoReserva.COMPLETADA
        ).order_by("-fecha", "-hora")
