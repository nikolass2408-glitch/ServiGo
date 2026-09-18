from django.urls import path

from ..controllers.reporte_controller import (
    ResumenReservasView,
    ServiciosMasSolicitadosView,
    CitasCompletadasView,
    IngresosEstimadosView,
)

urlpatterns = [
    path("profesional/<int:profesional_id>/estadisticas/resumen/", ResumenReservasView.as_view(), name="resumen-reservas"),
    path("profesional/<int:profesional_id>/estadisticas/servicios/", ServiciosMasSolicitadosView.as_view(), name="servicios-mas-solicitados"),
    path("profesional/<int:profesional_id>/estadisticas/completadas/", CitasCompletadasView.as_view(), name="citas-completadas"),
    path("profesional/<int:profesional_id>/estadisticas/ingresos/", IngresosEstimadosView.as_view(), name="ingresos-estimados"),
]
