from rest_framework import generics

from ..repositories.horario_repository import HorarioRepository
from ..serializers import HorarioSerializer


class CrearHorarioView(generics.CreateAPIView):
    serializer_class = HorarioSerializer

    def get_queryset(self):
        return HorarioRepository.listar_todos()


class ModificarHorarioView(generics.UpdateAPIView):
    serializer_class = HorarioSerializer

    def get_queryset(self):
        return HorarioRepository.listar_todos()
