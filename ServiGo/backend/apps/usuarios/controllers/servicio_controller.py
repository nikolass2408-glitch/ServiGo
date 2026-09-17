from rest_framework import generics

from ..repositories.servicio_repository import ServicioRepository
from ..serializers import ServicioSerializer


class CrearServicioView(generics.CreateAPIView):
    serializer_class = ServicioSerializer

    def get_queryset(self):
        return ServicioRepository.listar_todos()
