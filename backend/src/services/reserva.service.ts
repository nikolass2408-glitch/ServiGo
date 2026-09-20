import { ReservaRepository } from "../repositories/reserva.repository";
import { HorarioRepository } from "../repositories/horario.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ServicioRepository } from "../repositories/servicio.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { NotificacionRepository } from "../repositories/notificacion.repository";
import { ESTADOS_RESERVA } from "../data/estadosReserva";
import { ROLES } from "../data/roles";
import { TIPOS_NOTIFICACION } from "../data/tiposNotificacion";

function validarFecha(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw Object.assign(
      new Error("La fecha debe tener formato YYYY-MM-DD."),
      { statusCode: 400 }
    );
  }

  const d = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(d.getTime())) {
    throw Object.assign(new Error("Fecha inválida."), { statusCode: 400 });
  }

  return d;
}

function validarHora(hora: string) {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) {
    throw Object.assign(
      new Error("La hora debe tener formato HH:MM o HH:MM:SS."),
      { statusCode: 400 }
    );
  }

  return hora.length === 5 ? `${hora}:00` : hora;
}

function diaSemana(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  return (d.getDay() + 6) % 7;
}

function hoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

export class ReservaService {
  static async crear(data: any, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(
      data.profesional
    );

    const servicio = await ServicioRepository.buscarPorId(data.servicio);

    const clienteId =
      actor.rol === ROLES.ADMIN && data.cliente ? data.cliente : actor.id;

    const cliente = await UsuarioRepository.buscarPorId(clienteId);

    if (!profesional) {
      throw Object.assign(
        new Error("El profesional no existe."),
        { statusCode: 404 }
      );
    }

    if (!servicio) {
      throw Object.assign(
        new Error("El servicio no existe."),
        { statusCode: 404 }
      );
    }

    if (!cliente) {
      throw Object.assign(
        new Error("El cliente no existe."),
        { statusCode: 404 }
      );
    }

    if (!profesional.activo) {
      throw Object.assign(
        new Error("El profesional no está disponible actualmente."),
        { statusCode: 400 }
      );
    }

    if (
      servicio.profesional.toString() !== profesional._id.toString()
    ) {
      throw Object.assign(
        new Error("El servicio no pertenece a este profesional."),
        { statusCode: 400 }
      );
    }

    if (!servicio.activo) {
      throw Object.assign(
        new Error("El servicio no está disponible."),
        { statusCode: 400 }
      );
    }

    if (cliente.rol !== ROLES.CLI) {
      throw Object.assign(
        new Error("El usuario seleccionado no tiene rol de cliente."),
        { statusCode: 400 }
      );
    }

    validarFecha(data.fecha);

    if (data.fecha < hoyISO()) {
      throw Object.assign(
        new Error("No puedes crear una reserva en una fecha pasada."),
        { statusCode: 400 }
      );
    }

    const hora = validarHora(data.hora);
    const dia = diaSemana(data.fecha);

    const horario = await HorarioRepository.existeHorarioValido(
      profesional._id.toString(),
      dia,
      hora
    );

    if (!horario) {
      throw Object.assign(
        new Error("La hora seleccionada está fuera del horario de atención."),
        { statusCode: 400 }
      );
    }

    if (
      await ReservaRepository.existeConflicto(
        profesional._id.toString(),
        data.fecha,
        hora
      )
    ) {
      throw Object.assign(
        new Error("Ese horario ya está reservado."),
        { statusCode: 409 }
      );
    }

    const reserva = await ReservaRepository.crear({
      profesional: profesional._id,
      servicio: servicio._id,
      cliente: cliente._id,
      fecha: data.fecha,
      hora,
      estado: ESTADOS_RESERVA.PENDIENTE,
      notas: data.notas || ""
    });

    await NotificacionRepository.crear({
      usuario: profesional.usuario,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.NUEVA_RESERVA,
      mensaje: `Nueva reserva de ${cliente.username} para el ${reserva.fecha} a las ${reserva.hora}.`
    });

    return ReservaRepository.buscarPorId(reserva._id.toString());
  }

  static async buscar(id: string) {
    const reserva = await ReservaRepository.buscarPorId(id);

    if (!reserva) {
      throw Object.assign(
        new Error("La reserva no existe."),
        { statusCode: 404 }
      );
    }

    return reserva;
  }

  static async confirmar(id: string, actor: any) {
    const reserva: any = await this.buscar(id);

    await this.validarAccesoReserva(reserva, actor, true);

    if (reserva.estado !== ESTADOS_RESERVA.PENDIENTE) {
      throw new Error(
        "Solo se pueden confirmar reservas pendientes."
      );
    }

    reserva.estado = ESTADOS_RESERVA.CONFIRMADA;

    await reserva.save();

    await NotificacionRepository.crear({
      usuario: reserva.cliente._id || reserva.cliente,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.CONFIRMACION,
      mensaje: `Tu reserva para ${reserva.servicio.nombre} el ${reserva.fecha} a las ${reserva.hora} ha sido confirmada.`
    });

    return this.buscar(id);
  }

  static async completar(id: string, actor: any) {
    const reserva: any = await this.buscar(id);

    await this.validarAccesoReserva(reserva, actor, true);

    if (reserva.estado !== ESTADOS_RESERVA.CONFIRMADA) {
      throw Object.assign(
        new Error("Solo se pueden completar reservas confirmadas."),
        { statusCode: 400 }
      );
    }

    reserva.estado = ESTADOS_RESERVA.COMPLETADA;

    await reserva.save();

    return this.buscar(id);
  }

  static async cancelar(id: string, actor: any) {
    const reserva: any = await this.buscar(id);

    await this.validarAccesoReserva(reserva, actor, false);

    if (
      [ESTADOS_RESERVA.CANCELADA, ESTADOS_RESERVA.COMPLETADA].includes(
        reserva.estado
      )
    ) {
      throw new Error("Esta reserva no se puede cancelar.");
    }

    reserva.estado = ESTADOS_RESERVA.CANCELADA;

    await reserva.save();

    await NotificacionRepository.crear({
      usuario: reserva.cliente._id || reserva.cliente,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.CANCELACION,
      mensaje: `Tu reserva para ${reserva.servicio.nombre} el ${reserva.fecha} a las ${reserva.hora} ha sido cancelada.`
    });

    return this.buscar(id);
  }

  static async rechazar(id: string, actor: any) {
    const reserva: any = await this.buscar(id);

    await this.validarAccesoReserva(reserva, actor, true);

    if (reserva.estado !== ESTADOS_RESERVA.PENDIENTE) {
      throw new Error(
        "Solo se pueden rechazar reservas pendientes."
      );
    }

    reserva.estado = ESTADOS_RESERVA.RECHAZADA;

    await reserva.save();

    return this.buscar(id);
  }

  static async reprogramar(
    id: string,
    fecha: string,
    horaRaw: string,
    actor: any
  ) {
    const reserva: any = await this.buscar(id);

    await this.validarAccesoReserva(reserva, actor, false);

    if (
      [ESTADOS_RESERVA.CANCELADA, ESTADOS_RESERVA.COMPLETADA].includes(
        reserva.estado
      )
    ) {
      throw new Error("No se puede reprogramar esta reserva.");
    }

    validarFecha(fecha);

    if (fecha < hoyISO()) {
      throw new Error(
        "No puedes reprogramar para una fecha pasada."
      );
    }

    const hora = validarHora(horaRaw);
    const profesionalId = reserva.profesional._id.toString();
    const dia = diaSemana(fecha);

    const horario = await HorarioRepository.existeHorarioValido(
      profesionalId,
      dia,
      hora
    );

    if (!horario) {
      throw new Error(
        "La nueva hora está fuera del horario de atención."
      );
    }

    if (
      await ReservaRepository.existeConflicto(
        profesionalId,
        fecha,
        hora,
        id
      )
    ) {
      throw Object.assign(
        new Error("El nuevo horario ya está reservado."),
        { statusCode: 409 }
      );
    }

    reserva.fecha = fecha;
    reserva.hora = hora;
    reserva.estado = ESTADOS_RESERVA.REPROGRAMADA;

    await reserva.save();

    await NotificacionRepository.crear({
      usuario: reserva.cliente._id || reserva.cliente,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.REPROGRAMACION,
      mensaje: `Tu reserva para ${reserva.servicio.nombre} ha sido reprogramada para el ${reserva.fecha} a las ${reserva.hora}.`
    });

    return this.buscar(id);
  }

  static async disponibilidad(
    profesionalId: string,
    fecha: string
  ) {
    if (!profesionalId || !fecha) {
      throw Object.assign(
        new Error("Debes enviar profesional y fecha."),
        { statusCode: 400 }
      );
    }

    validarFecha(fecha);

    const dia = diaSemana(fecha);

    const horarios = await HorarioRepository.activosPorDia(
      profesionalId,
      dia
    );

    const reservas =
      await ReservaRepository.delDiaExcluyendoCanceladas(
        profesionalId,
        fecha
      );

    return {
      profesional: profesionalId,
      fecha,
      horarios: horarios.map((h) => ({
        hora_inicio: h.horaInicio,
        hora_fin: h.horaFin
      })),
      horas_ocupadas: reservas.map((r) => r.hora)
    };
  }

  static async listar(actor: any) {
    if (actor.rol === ROLES.ADMIN) {
      return ReservaRepository.listarTodas();
    }

    if (actor.rol === ROLES.CLI) {
      return (await ReservaRepository.listarTodas()).filter(
        (r: any) => r.cliente?._id?.toString() === actor.id
      );
    }

    const profesional =
      await ProfesionalRepository.buscarPorUsuario(actor.id);

    if (!profesional) return [];

    return (await ReservaRepository.listarTodas()).filter(
      (r: any) =>
        r.profesional?._id?.toString() ===
        profesional._id.toString()
    );
  }

  private static async validarAccesoReserva(
    reserva: any,
    actor: any,
    soloProfesional: boolean
  ) {
    if (actor.rol === ROLES.ADMIN) return;

    const profesionalUsuarioId =
      reserva.profesional.usuario?._id?.toString() ||
      reserva.profesional.usuario?.toString();

    const clienteId =
      reserva.cliente?._id?.toString() ||
      reserva.cliente?.toString();

    if (soloProfesional) {
      if (
        actor.rol !== ROLES.PRO ||
        profesionalUsuarioId !== actor.id
      ) {
        throw Object.assign(
          new Error(
            "Solo el profesional dueño de la reserva puede realizar esta acción."
          ),
          { statusCode: 403 }
        );
      }
    } else {
      if (actor.rol === ROLES.CLI && clienteId === actor.id) {
        return;
      }

      if (
        actor.rol === ROLES.PRO &&
        profesionalUsuarioId === actor.id
      ) {
        return;
      }

      throw Object.assign(
        new Error("No tienes permisos sobre esta reserva."),
        { statusCode: 403 }
      );
    }
  }
}