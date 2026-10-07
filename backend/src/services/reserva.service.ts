import { ReservaRepository } from "../repositories/reserva.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ServicioRepository } from "../repositories/servicio.repository";
import { HorarioRepository } from "../repositories/horario.repository";
import { NotificacionRepository } from "../repositories/notificacion.repository";
import { BloqueoHorarioRepository } from "../repositories/bloqueoHorario.repository";
import { MailService, DatosReservaCorreo } from "./mail.service";
import { ESTADOS_RESERVA } from "../data/estadosReserva";
import { ROLES } from "../data/roles";
import { TIPOS_NOTIFICACION } from "../data/tiposNotificacion";
import {
  validarAccionReserva,
  calcularMinutosOcupados,
  validarFechaHoraReserva,
  validarHorarioDisponible,
  validarPropiedadProfesionalReserva,
  validarPropiedadReserva,
} from "./reserva.rules";

function minutos(hora: string) {
  const [horas, minutosHora] = hora.split(":").map(Number);
  return horas * 60 + minutosHora;
}

function idRelacionado(valor: any) {
  return String(valor?._id || valor);
}

function mapearConflictoDeReserva(error: any): never {
  if (
    error?.code === 11000 &&
    (error?.keyPattern?.minutosOcupados ||
      error?.message?.includes("reserva_minuto_profesional_unique"))
  ) {
    throw Object.assign(
      new Error("El horario seleccionado ya no está disponible."),
      { statusCode: 409 }
    );
  }
  throw error;
}

async function validarHorarioProfesional(
  profesionalId: string,
  fecha: string,
  hora: string,
  duracion: number
) {
  const finSolicitado = minutos(hora) + duracion;
  const horaFin = `${String(Math.floor(finSolicitado / 60)).padStart(2, "0")}:${String(finSolicitado % 60).padStart(2, "0")}`;
  if (
    await BloqueoHorarioRepository.existeSolapamiento(
      profesionalId,
      fecha,
      hora,
      horaFin
    )
  ) {
    throw Object.assign(new Error("El horario seleccionado está bloqueado."), {
      statusCode: 409,
    });
  }

  const dia = new Date(`${fecha}T12:00:00`).getDay();
  const horarios = await HorarioRepository.activosPorDia(profesionalId, dia);
  const inicio = minutos(hora);
  const fin = inicio + duracion;
  const disponible = horarios.some(
    (horario) =>
      inicio >= minutos(horario.horaInicio) &&
      fin <= minutos(horario.horaFin)
  );
  if (!disponible) {
    throw Object.assign(
      new Error("El horario seleccionado no está dentro de la disponibilidad del profesional."),
      { statusCode: 409 }
    );
  }
}

export class ReservaService {
  /**
   * Crea una nueva reserva y envía correo de confirmación al cliente.
   */
  static async crear(datos: any, user: any) {
    validarFechaHoraReserva(String(datos.fecha || ""), String(datos.hora || ""));

    const profesional = await ProfesionalRepository.buscarPorId(
      String(datos.profesional || "")
    );
    if (!profesional || !profesional.activo) {
      throw Object.assign(new Error("El profesional no existe o no está disponible."), {
        statusCode: 404,
      });
    }

    const servicio = await ServicioRepository.buscarPorId(String(datos.servicio || ""));
    if (
      !servicio ||
      !servicio.activo ||
      servicio.profesional.toString() !== profesional._id.toString()
    ) {
      throw Object.assign(new Error("El servicio no existe o no está disponible."), {
        statusCode: 404,
      });
    }

    const fecha = String(datos.fecha);
    const hora = String(datos.hora);
    await validarHorarioProfesional(
      profesional._id.toString(),
      fecha,
      hora,
      Number(servicio.duracion)
    );

    const existeConflicto = await ReservaRepository.existeConflictoPorDuracion(
      profesional._id.toString(),
      fecha,
      hora,
      Number(servicio.duracion)
    );
    validarHorarioDisponible(existeConflicto);

    const payloadReserva = {
      profesional: profesional._id,
      servicio: servicio._id,
      cliente: user?.rol === ROLES.ADMIN && datos.cliente ? datos.cliente : user?.id,
      fecha,
      hora,
      minutosOcupados: calcularMinutosOcupados(
        hora,
        Number(servicio.duracion)
      ),
      notas: String(datos.notas || ""),
    };
    if (!payloadReserva.cliente) {
      throw Object.assign(new Error("No se pudo determinar el cliente de la reserva."), {
        statusCode: 400,
      });
    }
    let nuevaReserva: any;
    try {
      nuevaReserva = await ReservaRepository.crear(payloadReserva);
    } catch (error) {
      mapearConflictoDeReserva(error);
    }

    const reservaPopulada: any = await ReservaRepository.buscarPorId(
      String(nuevaReserva._id)
    );

    await NotificacionRepository.crear({
      usuario: profesional.usuario,
      reserva: nuevaReserva._id,
      tipo: TIPOS_NOTIFICACION.NUEVA_RESERVA,
      mensaje: `Tienes una nueva solicitud para ${servicio.nombre} el ${fecha} a las ${hora}.`,
    });
    await NotificacionRepository.crear({
      usuario: payloadReserva.cliente,
      reserva: nuevaReserva._id,
      tipo: TIPOS_NOTIFICACION.NUEVA_RESERVA,
      mensaje: `Tu solicitud de reserva para ${servicio.nombre} fue enviada.`,
    });

    const datosCorreo: DatosReservaCorreo = {
      to: user?.email || reservaPopulada?.cliente?.email,
      nombreCliente: user?.nombre || reservaPopulada?.cliente?.nombre || "Cliente",
      servicio: reservaPopulada?.servicio?.nombre || "Servicio contratado",
      profesional: reservaPopulada?.profesional?.nombre,
      fecha: reservaPopulada?.fecha || datos.fecha,
      hora: reservaPopulada?.hora || datos.hora,
      codigo: String(nuevaReserva._id).slice(-6).toUpperCase(),
    };

    MailService.enviarConfirmacionReserva(datosCorreo).catch((error) => {
      console.error("[MAIL ERROR] Error al enviar correo de creación de reserva:", error);
    });

    return reservaPopulada || nuevaReserva;
  }

  /**
   * Obtiene la lista de reservas asociadas al usuario autenticado.
   */
  static async listar(user: any) {
    // Si el usuario es un cliente, se pueden filtrar sus reservas,
    // o bien listar todas si es administrador/profesional.
    if (user?.rol === ROLES.CLI) {
      return await ReservaRepository.deCliente(user.id);
    }
    if (user?.rol === ROLES.PRO) {
      const profesional = await ProfesionalRepository.buscarPorUsuario(user.id);
      return profesional
        ? await ReservaRepository.deProfesional(String(profesional._id))
        : [];
    }
    return await ReservaRepository.listarTodas();
  }

  private static async buscarParaAccion(id: string, user: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw Object.assign(new Error("Reserva no encontrada."), { statusCode: 404 });
    }

    const clienteId = String(reserva.cliente?._id || reserva.cliente);
    if (user?.rol === ROLES.CLI) validarPropiedadReserva(clienteId, user.id);
    if (user?.rol === ROLES.PRO) {
      const profesional = await ProfesionalRepository.buscarPorUsuario(user.id);
      if (!profesional) {
        throw Object.assign(new Error("No tienes un perfil de prestador activo."), {
          statusCode: 403,
        });
      }
      const reservaProfesionalId = String(
        reserva.profesional?._id || reserva.profesional
      );
      validarPropiedadProfesionalReserva(
        reservaProfesionalId,
        String(profesional._id)
      );
    }

    return reserva;
  }

  /**
   * Busca el detalle de una reserva por ID.
   */
  static async buscar(id: string, user?: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw Object.assign(new Error("Reserva no encontrada."), { statusCode: 404 });
    }
    if (user && user.rol !== ROLES.ADMIN) {
      const clienteId = idRelacionado(reserva.cliente);
      const esCliente = user.rol === ROLES.CLI && clienteId === user.id;
      let esProfesional = false;
      if (user.rol === ROLES.PRO) {
        const profesional = await ProfesionalRepository.buscarPorUsuario(user.id);
        esProfesional = Boolean(
          profesional &&
          idRelacionado(reserva.profesional) === profesional._id.toString()
        );
      }
      if (!esCliente && !esProfesional) {
        throw Object.assign(new Error("No tienes permisos para consultar esta reserva."), {
          statusCode: 403,
        });
      }
    }
    return reserva;
  }

  /**
   * Confirma una reserva y notifica al cliente por correo.
   */
  static async confirmar(id: string, user: any) {
    if (user?.rol !== ROLES.ADMIN && user?.rol !== ROLES.PRO) {
      throw Object.assign(new Error("Solo el profesional puede confirmar una reserva."), {
        statusCode: 403,
      });
    }
    const reserva: any = await this.buscarParaAccion(id, user);
    validarAccionReserva(reserva.estado, "confirmar");

    reserva.estado = ESTADOS_RESERVA.CONFIRMADA;
    await reserva.save();
    await NotificacionRepository.crear({
      usuario: idRelacionado(reserva.cliente),
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.CONFIRMACION,
      mensaje: `Tu reserva para ${reserva.servicio?.nombre || "el servicio"} fue confirmada.`,
    });

    // Notificar al cliente la confirmación
    const datosCorreo: DatosReservaCorreo = {
      to: reserva.cliente?.email,
      nombreCliente: reserva.cliente?.nombre || "Cliente",
      servicio: reserva.servicio?.nombre || "Servicio",
      profesional: reserva.profesional?.nombre,
      fecha: reserva.fecha,
      hora: reserva.hora,
      codigo: String(reserva._id).slice(-6).toUpperCase(),
    };

    MailService.enviarConfirmacionReserva(datosCorreo).catch((error) => {
      console.error("[MAIL ERROR] Error al enviar correo de confirmación:", error);
    });

    return reserva;
  }

  /**
   * Marca una reserva como completada.
   */
  static async completar(id: string, user: any) {
    if (user?.rol !== ROLES.ADMIN && user?.rol !== ROLES.PRO) {
      throw Object.assign(new Error("Solo un profesional puede completar una reserva."), {
        statusCode: 403,
      });
    }
    const reserva: any = await this.buscarParaAccion(id, user);
    if (reserva.estado !== ESTADOS_RESERVA.CONFIRMADA) {
      throw Object.assign(new Error("Solo se pueden completar reservas confirmadas."), {
        statusCode: 409,
      });
    }
    reserva.estado = ESTADOS_RESERVA.COMPLETADA;
    await reserva.save();
    return reserva;
  }

  /**
   * Cancela una reserva.
   */
  static async cancelar(id: string, user: any) {
    const reserva: any = await this.buscarParaAccion(id, user);
    validarAccionReserva(reserva.estado, "cancelar");

    reserva.estado = ESTADOS_RESERVA.CANCELADA || "CANCELADA";
    reserva.minutosOcupados = undefined;
    await reserva.save();
    const notificarUsuario =
      user?.rol === ROLES.PRO
        ? idRelacionado(reserva.cliente)
        : idRelacionado(reserva.profesional?.usuario);
    await NotificacionRepository.crear({
      usuario: notificarUsuario,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.CANCELACION,
      mensaje: `La reserva para ${reserva.servicio?.nombre || "el servicio"} el ${reserva.fecha} a las ${reserva.hora} fue cancelada.`,
    });
    return reserva;
  }

  /**
   * Rechaza una reserva.
   */
  static async rechazar(id: string, user: any) {
    if (user?.rol !== ROLES.ADMIN && user?.rol !== ROLES.PRO) {
      throw Object.assign(new Error("Solo un profesional puede rechazar una reserva."), {
        statusCode: 403,
      });
    }
    const reserva: any = await this.buscarParaAccion(id, user);
    if (![ESTADOS_RESERVA.PENDIENTE, ESTADOS_RESERVA.REPROGRAMADA].includes(reserva.estado)) {
      throw Object.assign(new Error("Solo se pueden rechazar solicitudes pendientes."), {
        statusCode: 409,
      });
    }
    reserva.estado = ESTADOS_RESERVA.RECHAZADA || "RECHAZADA";
    reserva.minutosOcupados = undefined;
    await reserva.save();
    await NotificacionRepository.crear({
      usuario: idRelacionado(reserva.cliente),
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.RECHAZO,
      mensaje: `El profesional rechazó la solicitud para ${reserva.servicio?.nombre || "el servicio"}.`,
    });
    return reserva;
  }

  /**
   * Reprograma fecha y hora de la reserva, validando que no haya conflictos.
   */
  static async reprogramar(id: string, nuevaFecha: string, nuevaHora: string, user: any) {
    const reserva: any = await this.buscarParaAccion(id, user);
    validarAccionReserva(reserva.estado, "reprogramar");
    validarFechaHoraReserva(nuevaFecha, nuevaHora);

    const profesionalId = idRelacionado(reserva.profesional);
    const servicioId = idRelacionado(reserva.servicio);
    const servicio = await ServicioRepository.buscarPorId(servicioId);
    if (!servicio) {
      throw Object.assign(new Error("El servicio de la reserva no existe."), {
        statusCode: 404,
      });
    }
    await validarHorarioProfesional(
      profesionalId,
      nuevaFecha,
      nuevaHora,
      Number(servicio.duracion)
    );

    const existeConflicto = await ReservaRepository.existeConflictoPorDuracion(
      profesionalId,
      nuevaFecha,
      nuevaHora,
      Number(servicio.duracion),
      id
    );

    validarHorarioDisponible(Boolean(existeConflicto));

    reserva.fecha = nuevaFecha;
    reserva.hora = nuevaHora;
    reserva.minutosOcupados = calcularMinutosOcupados(
      nuevaHora,
      Number(servicio.duracion)
    );
    try {
      await reserva.save();
    } catch (error) {
      mapearConflictoDeReserva(error);
    }
    const notificarUsuario =
      user?.rol === ROLES.PRO
        ? idRelacionado(reserva.cliente)
        : idRelacionado(reserva.profesional?.usuario);
    await NotificacionRepository.crear({
      usuario: notificarUsuario,
      reserva: reserva._id,
      tipo: TIPOS_NOTIFICACION.REPROGRAMACION,
      mensaje: `La reserva fue reprogramada para ${nuevaFecha} a las ${nuevaHora}.`,
    });

    // Opcional: enviar mail de notificación por reprogramación
    const datosCorreo: DatosReservaCorreo = {
      to: reserva.cliente?.email,
      nombreCliente: reserva.cliente?.nombre || "Cliente",
      servicio: reserva.servicio?.nombre || "Servicio",
      profesional: reserva.profesional?.nombre,
      fecha: nuevaFecha,
      hora: nuevaHora,
      codigo: String(reserva._id).slice(-6).toUpperCase(),
    };

    MailService.enviarConfirmacionReserva(datosCorreo).catch((error) => {
      console.error("[MAIL ERROR] Error al enviar correo de reprogramación:", error);
    });

    return reserva;
  }

  /**
   * Consulta las horas disponibles de un profesional para un día específico.
   */
  static async disponibilidad(
    profesionalId: string,
    fecha: string,
    servicioId?: string
  ) {
    validarFechaHoraReserva(fecha, "23:59", new Date(new Date().setHours(0, 0, 0, 0) - 1));
    const profesional = await ProfesionalRepository.buscarPorId(profesionalId);
    if (!profesional || !profesional.activo) {
      throw Object.assign(new Error("El profesional no existe o no está disponible."), {
        statusCode: 404,
      });
    }
    const servicios = (await ServicioRepository.deProfesional(profesionalId)).filter(
      (servicio) =>
        servicio.activo &&
        (!servicioId || servicio._id.toString() === servicioId)
    );
    const horarios = await HorarioRepository.activosPorDia(
      profesionalId,
      new Date(`${fecha}T12:00:00`).getDay()
    );
    const reservas = await ReservaRepository.delDiaExcluyendoCanceladas(
      profesionalId,
      fecha
    );
    const bloqueos = await BloqueoHorarioRepository.listarPorProfesional(profesionalId);
    const bloqueosDelDia = bloqueos.filter((bloqueo) => bloqueo.fecha === fecha);
    const ahora = new Date();
    const opciones = servicios.map((servicio) => {
      const duracion = Number(servicio.duracion);
      const horariosDisponibles: string[] = [];
      for (const horario of horarios) {
        const inicioHorario = minutos(horario.horaInicio);
        const finHorario = minutos(horario.horaFin);
        for (let inicio = inicioHorario; inicio + duracion <= finHorario; inicio += 30) {
          const hora = `${String(Math.floor(inicio / 60)).padStart(2, "0")}:${String(inicio % 60).padStart(2, "0")}`;
          if (new Date(`${fecha}T${hora}:00`) <= ahora) continue;
          const fin = inicio + duracion;
          const conflicto = reservas.some((reserva: any) => {
            const inicioExistente = minutos(reserva.hora);
            const finExistente = inicioExistente + Number(reserva.servicio?.duracion || 30);
            return inicio < finExistente && fin > inicioExistente;
          });
          const bloqueado = bloqueosDelDia.some(
            (bloqueo) =>
              inicio < minutos(bloqueo.horaFin) &&
              fin > minutos(bloqueo.horaInicio)
          );
          if (!conflicto && !bloqueado) horariosDisponibles.push(hora);
        }
      }
      return {
        servicio: {
          id: servicio._id,
          nombre: servicio.nombre,
          duracion,
          precio: servicio.precio,
        },
        horariosDisponibles,
      };
    });
    return { profesional: profesional._id, fecha, servicios: opciones };
  }

  static async historial(user: any) {
    const reservas: any[] = await this.listar(user);
    const hoy = new Date().toISOString().slice(0, 10);
    const estadosFinales = [
      ESTADOS_RESERVA.CANCELADA,
      ESTADOS_RESERVA.COMPLETADA,
      ESTADOS_RESERVA.RECHAZADA,
    ];
    return reservas.filter(
      (reserva) =>
        estadosFinales.includes(reserva.estado) ||
        (typeof reserva.fecha === "string" && reserva.fecha < hoy)
    );
  }
}