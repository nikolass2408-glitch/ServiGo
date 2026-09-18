from ..models import Notificacion


class NotificacionRepository:

    @staticmethod
    def crear(usuario, reserva, tipo, mensaje):
        return Notificacion.objects.create(
            usuario=usuario,
            reserva=reserva,
            tipo=tipo,
            mensaje=mensaje
        )

    @staticmethod
    def por_usuario(usuario_id):
        return Notificacion.objects.filter(
            usuario_id=usuario_id
        ).order_by("-creada_en")
