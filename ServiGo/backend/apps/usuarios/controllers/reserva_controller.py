from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..repositories.reserva_repository import ReservaRepository
from ..serializers import ReservaSerializer
from ..services.reserva_service import ReservaService
from ..services.exceptions import ReglaNegocioError


class CrearReservaView(generics.CreateAPIView):
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return ReservaRepository.listar_todas()

    def perform_create(self, serializer):
        # La validación de reglas de negocio ya ocurrió en el
        # serializer (horario, duplicados, etc). El service solo
        # guarda y dispara el efecto secundario (notificación).
        ReservaService.crear(serializer)


class ListaReservasView(generics.ListAPIView):
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return ReservaRepository.listar_todas()


class DetalleReservaView(generics.RetrieveAPIView):
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return ReservaRepository.listar_todas()


class HistorialReservasView(generics.ListAPIView):
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return ReservaRepository.historial_ordenado()


class _AccionReservaView(APIView):
    """Base para las vistas que ejecutan una acción de negocio
    sobre una reserva y devuelven la reserva actualizada."""

    accion = None  # implementado por cada subclase

    def update(self, request, *args, **kwargs):
        try:
            reserva = self.accion(request, kwargs["pk"])
        except ReglaNegocioError as error:
            return Response(
                {"error": error.mensaje},
                status=error.status_code
            )

        return Response(
            ReservaSerializer(reserva).data,
            status=status.HTTP_200_OK
        )

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class ConfirmarReservaView(_AccionReservaView):
    def accion(self, request, pk):
        return ReservaService.confirmar(pk)


class CancelarReservaView(_AccionReservaView):
    def accion(self, request, pk):
        return ReservaService.cancelar(pk)


class RechazarReservaView(_AccionReservaView):
    def accion(self, request, pk):
        return ReservaService.rechazar(pk)


class ReprogramarReservaView(_AccionReservaView):
    def accion(self, request, pk):
        return ReservaService.reprogramar(
            pk,
            request.data.get("fecha"),
            request.data.get("hora"),
        )


class DisponibilidadView(APIView):

    def get(self, request):
        try:
            disponibilidad = ReservaService.disponibilidad(
                request.query_params.get("profesional"),
                request.query_params.get("fecha"),
            )
        except ReglaNegocioError as error:
            return Response(
                {"error": error.mensaje},
                status=error.status_code
            )

        return Response(disponibilidad)


class HistorialClienteView(generics.ListAPIView):
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return ReservaRepository.de_cliente_con_profesional(
            self.kwargs["cliente_id"],
            self.kwargs["profesional_id"],
        )
