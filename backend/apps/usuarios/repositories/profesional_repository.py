from ..models import Profesional


class ProfesionalRepository:

    @staticmethod
    def listar_todos():
        return Profesional.objects.all()

    @staticmethod
    def buscar_por_id(profesional_id):
        return Profesional.objects.get(pk=profesional_id)
