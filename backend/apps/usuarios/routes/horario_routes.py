from django.urls import path

from ..controllers.horario_controller import (
    CrearHorarioView,
    ModificarHorarioView,
)

urlpatterns = [
    path("horarios/", CrearHorarioView.as_view(), name="crear-horario"),
    path("horarios/<int:pk>/modificar/", ModificarHorarioView.as_view(), name="modificar-horario"),
]
