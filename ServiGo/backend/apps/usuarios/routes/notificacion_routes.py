from django.urls import path

from ..controllers.notificacion_controller import (
    InformacionClienteView,
    ListaNotificacionesView,
    RecordatorioReservaView,
)

urlpatterns = [
    path("clientes/<int:pk>/", InformacionClienteView.as_view(), name="informacion-cliente"),
    path("notificaciones/<int:usuario_id>/", ListaNotificacionesView.as_view(), name="lista-notificaciones"),
    path("reservas/<int:pk>/recordatorio/", RecordatorioReservaView.as_view(), name="recordatorio-reserva"),
]
