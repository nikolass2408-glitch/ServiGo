import { ReservaRepository } from "../repositories/reserva.repository";
import { ServicioRepository } from "../repositories/servicio.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ESTADOS_RESERVA } from "../data/estadosReserva";

export class ReporteService {
  static async profesionalValido(id: string) {
    const profesional = await ProfesionalRepository.buscarPorId(id);

    if (!profesional) {
      throw Object.assign(
        new Error("El profesional no existe."),
        { statusCode: 404 }
      );
    }

    return profesional;
  }

  static async resumenReservas(profesionalId: string) {
    await this.profesionalValido(profesionalId);

    const reservas = await ReservaRepository
      .porProfesional(profesionalId)
      .lean();

    const contar = (estado: string) =>
      reservas.filter((r) => r.estado === estado).length;

    return {
      total: reservas.length,
      pendientes: contar(ESTADOS_RESERVA.PENDIENTE),
      confirmadas: contar(ESTADOS_RESERVA.CONFIRMADA),
      canceladas: contar(ESTADOS_RESERVA.CANCELADA),
      reprogramadas: contar(ESTADOS_RESERVA.REPROGRAMADA),
      completadas: contar(ESTADOS_RESERVA.COMPLETADA),
      rechazadas: contar(ESTADOS_RESERVA.RECHAZADA)
    };
  }

  static async serviciosMasSolicitados(profesionalId: string) {
    await this.profesionalValido(profesionalId);

    const servicios =
      await ServicioRepository.deProfesional(profesionalId);

    const reservas =
      await ReservaRepository.porProfesional(profesionalId).lean();

    return servicios
      .map((s) => ({
        servicio: s._id,
        nombre: s.nombre,
        reservas: reservas.filter(
          (r) =>
            r.servicio.toString() === s._id.toString() &&
            r.estado !== ESTADOS_RESERVA.CANCELADA &&
            r.estado !== ESTADOS_RESERVA.RECHAZADA
        ).length
      }))
      .sort((a, b) => b.reservas - a.reservas);
  }

  static async citasCompletadas(profesionalId: string) {
    await this.profesionalValido(profesionalId);

    const reservas: any[] =
      await ReservaRepository
        .completadasOrdenadas(profesionalId)
        .lean();

    return {
      profesional: profesionalId,
      total_completadas: reservas.length,
      citas: reservas
    };
  }

  static async ingresosEstimados(profesionalId: string) {
    await this.profesionalValido(profesionalId);

    const reservas: any[] =
      await ReservaRepository
        .completadasConServicio(profesionalId)
        .lean();

    const total = reservas.reduce(
      (sum, r: any) =>
        sum + Number(r.servicio?.precio || 0),
      0
    );

    return {
      profesional: profesionalId,
      citas_completadas: reservas.length,
      ingresos_estimados: total
    };
  }
}