from . import (
    auth_routes,
    profesional_routes,
    servicio_routes,
    horario_routes,
    reserva_routes,
    notificacion_routes,
    reporte_routes,
)

urlpatterns = (
    auth_routes.urlpatterns
    + profesional_routes.urlpatterns
    + servicio_routes.urlpatterns
    + horario_routes.urlpatterns
    + reserva_routes.urlpatterns
    + notificacion_routes.urlpatterns
    + reporte_routes.urlpatterns
)
