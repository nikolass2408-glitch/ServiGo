from django.urls import path

from ..controllers.reserva_controller import (
    CrearReservaView,
    ListaReservasView,
    DetalleReservaView,
    ConfirmarReservaView,
    CancelarReservaView,
    ReprogramarReservaView,
    HistorialReservasView,
    DisponibilidadView,
    RechazarReservaView,
    HistorialClienteView,
)

urlpatterns = [
    path("reservas/", CrearReservaView.as_view(), name="crear-reserva"),
    path("reservas/lista/", ListaReservasView.as_view(), name="lista-reservas"),
    path("reservas/<int:pk>/", DetalleReservaView.as_view(), name="detalle-reserva"),
    path("reservas/<int:pk>/confirmar/", ConfirmarReservaView.as_view(), name="confirmar-reserva"),
    path("reservas/<int:pk>/cancelar/", CancelarReservaView.as_view(), name="cancelar-reserva"),
    path("reservas/<int:pk>/reprogramar/", ReprogramarReservaView.as_view(), name="reprogramar-reserva"),
    path("reservas/historial/", HistorialReservasView.as_view(), name="historial-reservas"),
    path("reservas/disponibilidad/", DisponibilidadView.as_view(), name="disponibilidad"),
    path("reservas/<int:pk>/rechazar/", RechazarReservaView.as_view(), name="rechazar-reserva"),
    path("profesional/<int:profesional_id>/clientes/<int:cliente_id>/historial/", HistorialClienteView.as_view(), name="historial-cliente"),
]
