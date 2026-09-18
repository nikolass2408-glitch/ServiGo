from ..models import Servicio


class ServicioRepository:

    @staticmethod
    def listar_todos():
        return Servicio.objects.all()

    @staticmethod
    def buscar_por_id(servicio_id):
        return Servicio.objects.get(pk=servicio_id)

    @staticmethod
    def de_profesional(profesional_id):
        return Servicio.objects.filter(profesional_id=profesional_id)
