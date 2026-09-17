from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..repositories.usuario_repository import UsuarioRepository
from ..repositories.notificacion_repository import NotificacionRepository
from ..serializers import UsuarioSerializer, NotificacionSerializer
from ..services.notificacion_service import NotificacionService
from ..services.exceptions import ReglaNegocioError


class InformacionClienteView(generics.RetrieveAPIView):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        return UsuarioRepository.clientes()


class ListaNotificacionesView(generics.ListAPIView):
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        return NotificacionRepository.por_usuario(self.kwargs["usuario_id"])


class RecordatorioReservaView(APIView):

    def post(self, request, pk):
        try:
            reserva = NotificacionService.enviar_recordatorio(pk)
        except ReglaNegocioError as error:
            return Response(
                {"error": error.mensaje},
                status=error.status_code
            )

        return Response(
            {
                "mensaje": "Recordatorio enviado correctamente.",
                "reserva": reserva.id
            },
            status=status.HTTP_200_OK
        )
