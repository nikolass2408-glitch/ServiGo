from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..repositories.usuario_repository import UsuarioRepository
from ..serializers import (
    UsuarioSerializer,
    RegistroUsuarioSerializer,
    LoginSerializer,
)
from ..services.auth_service import AuthService
from ..services.exceptions import ReglaNegocioError


class ListaUsuariosView(generics.ListAPIView):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        return UsuarioRepository.listar_todos()


class RegistroUsuarioView(generics.CreateAPIView):
    serializer_class = RegistroUsuarioSerializer

    def get_queryset(self):
        return UsuarioRepository.listar_todos()


class LoginUsuarioView(APIView):

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            usuario = AuthService.login(
                serializer.validated_data["username"],
                serializer.validated_data["password"],
            )
        except ReglaNegocioError as error:
            return Response(
                {"error": error.mensaje},
                status=error.status_code
            )

        return Response({
            "mensaje": "Inicio de sesión exitoso",
            "usuario": UsuarioSerializer(usuario).data
        }, status=status.HTTP_200_OK)
