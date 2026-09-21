import { ReservaService } from "./reserva.service";
import { ReservaRepository } from "../repositories/reserva.repository";
import { NotificacionRepository } from "../repositories/notificacion.repository";
import { ESTADOS_RESERVA } from "../data/estadosReserva";
import { TIPOS_NOTIFICACION } from "../data/tiposNotificacion";
import { ROLES } from "../data/roles";

export class NotificacionService {
  static async listar(usuarioId: string, actor: any) {
    if (actor.rol !== ROLES.ADMIN && actor.id !== usuarioId) {
      throw Object.assign(new Error("No puedes consultar notificaciones de otro usuario."), { statusCode: 403 });
    }
    return NotificacionRepository.porUsuario(usuarioId);
  }

  static async enviarRecordatorio(reservaId: string, actor: any) {
    const reserva:any = await ReservaService.buscar(reservaId);
    if (actor.rol !== ROLES.ADMIN) {
      const clienteId = reserva.cliente?._id?.toString() || reserva.cliente?.toString();
      if (actor.id !== clienteId) throw Object.assign(new Error("Solo el cliente de la reserva puede solicitar el recordatorio."), { statusCode: 403 });
    }
    if ([ESTADOS_RESERVA.CANCELADA, ESTADOS_RESERVA.RECHAZADA, ESTADOS_RESERVA.COMPLETADA].includes(reserva.estado)) {
      throw new Error("Esta reserva no puede recibir recordatorio.");
    }
    await NotificacionRepository.crear({
      usuario: reserva.cliente._id || reserva.cliente,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.RECORDATORIO,
      mensaje: `Recordatorio: tienes una reserva para ${reserva.servicio.nombre} el ${reserva.fecha} a las ${reserva.hora}.`
    });
    return reserva;
  }
}
