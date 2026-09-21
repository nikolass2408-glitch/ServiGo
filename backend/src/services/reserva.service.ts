import { ReservaRepository } from "../repositories/reserva.repository";
import { MailService, DatosReservaCorreo } from "./mail.service"; // Ajusta la ruta si es necesario
import { ESTADOS_RESERVA } from "../data/estadosReserva";

export class ReservaService {
  /**
   * Crea una nueva reserva y envía correo de confirmación al cliente.
   */
  static async crear(datos: any, user: any) {
    // 1. Validar si ya existe un conflicto de horario para el profesional
    const existeConflicto = await ReservaRepository.existeConflicto(
      datos.profesional,
      datos.fecha,
      datos.hora
    );

    if (existeConflicto) {
      throw new Error("El profesional ya tiene una reserva en la fecha y hora seleccionadas.");
    }

    // 2. Asignar el cliente desde el usuario autenticado si no viene en el body
    const payloadReserva = {
      ...datos,
      cliente: datos.cliente || user?.id || user?._id,
    };

    // 3. Crear el registro base
    const nuevaReserva = await ReservaRepository.crear(payloadReserva);

    // 4. Buscar la reserva recien creada populando relaciones (cliente, servicio, profesional)
    const reservaPopulada: any = await ReservaRepository.buscarPorId(
      String(nuevaReserva._id)
    );

    // 5. Armar el payload para el correo
    const datosCorreo: DatosReservaCorreo = {
      to: user?.email || reservaPopulada?.cliente?.email,
      nombreCliente: user?.nombre || reservaPopulada?.cliente?.nombre || "Cliente",
      servicio: reservaPopulada?.servicio?.nombre || "Servicio contratado",
      profesional: reservaPopulada?.profesional?.nombre,
      fecha: reservaPopulada?.fecha || datos.fecha,
      hora: reservaPopulada?.hora || datos.hora,
      codigo: String(nuevaReserva._id).slice(-6).toUpperCase(),
    };

    // 6. Enviar notificación por correo de forma asíncrona (sin bloquear la respuesta HTTP)
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
    if (user?.rol === "CLIENTE") {
      // Ajustar según el esquema de roles de tu app
      return await ReservaRepository.deClienteConProfesional(user.id, user.profesionalId);
    }
    return await ReservaRepository.listarTodas();
  }

  /**
   * Busca el detalle de una reserva por ID.
   */
  static async buscar(id: string) {
    const reserva = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }
    return reserva;
  }

  /**
   * Confirma una reserva y notifica al cliente por correo.
   */
  static async confirmar(id: string, user: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    reserva.estado = ESTADOS_RESERVA.CONFIRMADA || "CONFIRMADA";
    await reserva.save();

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
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    reserva.estado = ESTADOS_RESERVA.COMPLETADA || "COMPLETADA";
    await reserva.save();
    return reserva;
  }

  /**
   * Cancela una reserva.
   */
  static async cancelar(id: string, user: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    reserva.estado = ESTADOS_RESERVA.CANCELADA || "CANCELADA";
    await reserva.save();
    return reserva;
  }

  /**
   * Rechaza una reserva.
   */
  static async rechazar(id: string, user: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    reserva.estado = ESTADOS_RESERVA.RECHAZADA || "RECHAZADA";
    await reserva.save();
    return reserva;
  }

  /**
   * Reprograma fecha y hora de la reserva, validando que no haya conflictos.
   */
  static async reprogramar(id: string, nuevaFecha: string, nuevaHora: string, user: any) {
    const reserva: any = await ReservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    // Verificar si el nuevo horario está ocupado
    const existeConflicto = await ReservaRepository.existeConflicto(
      String(reserva.profesional._id || reserva.profesional),
      nuevaFecha,
      nuevaHora,
      id
    );

    if (existeConflicto) {
      throw new Error("El nuevo horario seleccionado no está disponible.");
    }

    reserva.fecha = nuevaFecha;
    reserva.hora = nuevaHora;
    await reserva.save();

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
  static async disponibilidad(profesionalId: string, fecha: string) {
    const reservasOcupadas = await ReservaRepository.delDiaExcluyendoCanceladas(
      profesionalId,
      fecha
    );
    
    // Retorna la lista de reservas que ocupan espacio ese día
    return reservasOcupadas;
  }
}