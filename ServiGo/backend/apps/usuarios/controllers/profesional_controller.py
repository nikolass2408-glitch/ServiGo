from rest_framework import generics

from ..repositories.profesional_repository import ProfesionalRepository
from ..repositories.usuario_repository import UsuarioRepository
from ..serializers import ProfesionalSerializer, UsuarioSerializer


class CrearProfesionalView(generics.CreateAPIView):
    serializer_class = ProfesionalSerializer

    def get_queryset(self):
        return ProfesionalRepository.listar_todos()


class ClientesProfesionalView(generics.ListAPIView):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        profesional_id = self.kwargs["profesional_id"]
        return UsuarioRepository.clientes_de_profesional(profesional_id)
