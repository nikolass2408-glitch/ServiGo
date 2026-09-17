from ..models import Horario


class HorarioRepository:

    @staticmethod
    def listar_todos():
        return Horario.objects.all()

    @staticmethod
    def buscar_por_id(horario_id):
        return Horario.objects.get(pk=horario_id)

    @staticmethod
    def activos_por_dia(profesional_id, dia):
        return Horario.objects.filter(
            profesional_id=profesional_id,
            dia=dia,
            activo=True
        )

    @staticmethod
    def existe_horario_valido(profesional_id, dia, hora):
        return Horario.objects.filter(
            profesional_id=profesional_id,
            dia=dia,
            activo=True,
            hora_inicio__lte=hora,
            hora_fin__gt=hora
        ).exists()
