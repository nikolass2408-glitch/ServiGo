from django.urls import path

from ..controllers.profesional_controller import (
    CrearProfesionalView,
    ClientesProfesionalView,
)

urlpatterns = [
    path("profesionales/", CrearProfesionalView.as_view(), name="crear-profesional"),
    path("profesional/<int:profesional_id>/clientes/", ClientesProfesionalView.as_view(), name="clientes-profesional"),
]
