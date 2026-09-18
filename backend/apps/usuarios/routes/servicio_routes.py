from django.urls import path

from ..controllers.servicio_controller import CrearServicioView

urlpatterns = [
    path("servicios/", CrearServicioView.as_view(), name="crear-servicio"),
]
