from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..serializers import ReservaSerializer
from ..services.reporte_service import ReporteService


class ResumenReservasView(APIView):

    def get(self, request, profesional_id):
        resumen = ReporteService.resumen_reservas(profesional_id)
        return Response(resumen, status=status.HTTP_200_OK)


class ServiciosMasSolicitadosView(APIView):

    def get(self, request, profesional_id):
        resultado = ReporteService.servicios_mas_solicitados(profesional_id)
        return Response(resultado, status=status.HTTP_200_OK)


class CitasCompletadasView(APIView):

    def get(self, request, profesional_id):
        datos = ReporteService.citas_completadas(profesional_id)

        return Response(
            {
                "profesional": datos["profesional"],
                "total_completadas": datos["total_completadas"],
                "citas": ReservaSerializer(
                    datos["reservas"], many=True
                ).data
            },
            status=status.HTTP_200_OK
        )


class IngresosEstimadosView(APIView):

    def get(self, request, profesional_id):
        resultado = ReporteService.ingresos_estimados(profesional_id)
        return Response(resultado, status=status.HTTP_200_OK)
