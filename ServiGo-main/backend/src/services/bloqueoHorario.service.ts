import { BloqueoHorarioRepository } from "../repositories/bloqueoHorario.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

function minutos(hora: string) {
  const [horas, minutosHora] = hora.split(":").map(Number);
  return horas * 60 + minutosHora;
}

function validarFechaHora(fecha: string, hora: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    throw Object.assign(new Error("La fecha u hora del bloqueo no es válida."), { statusCode: 400 });
  }
  const fechaHora = new Date(`${fecha}T${hora}:00`);
  if (
    Number.isNaN(fechaHora.getTime()) ||
    fechaHora.toISOString().slice(0, 10) !== fecha ||
    fechaHora <= new Date()
  ) {
    throw Object.assign(new Error("El bloqueo debe tener una fecha y hora futuras válidas."), { statusCode: 400 });
  }
}

export class BloqueoHorarioService {
  static async listar(profesionalId: string, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(profesionalId);
    if (!profesional) throw Object.assign(new Error("Profesional no encontrado."), { statusCode: 404 });
    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes consultar estos bloqueos."), { statusCode: 403 });
    }
    return BloqueoHorarioRepository.listarPorProfesional(profesionalId);
  }

  static async crear(data: any, actor: any) {
    const profesionalId = String(data.profesional || "");
    const profesional = await ProfesionalRepository.buscarPorId(profesionalId);
    if (!profesional) throw Object.assign(new Error("Profesional no encontrado."), { statusCode: 404 });
    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes bloquear horarios de otro profesional."), { statusCode: 403 });
    }

    const fecha = String(data.fecha || "");
    const horaInicio = String(data.horaInicio || "");
    const horaFin = String(data.horaFin || "");
    validarFechaHora(fecha, horaInicio);
    validarFechaHora(fecha, horaFin);
    if (minutos(horaInicio) >= minutos(horaFin)) {
      throw Object.assign(new Error("La hora de inicio debe ser anterior a la hora de fin."), { statusCode: 400 });
    }
    if (await BloqueoHorarioRepository.solapado(profesionalId, fecha, horaInicio, horaFin)) {
      throw Object.assign(new Error("El horario se cruza con otro bloqueo existente."), { statusCode: 409 });
    }
    return BloqueoHorarioRepository.crear({
      profesional: profesional._id,
      fecha,
      horaInicio,
      horaFin,
      motivo: String(data.motivo || ""),
    });
  }

  static async eliminar(id: string, actor: any) {
    const bloqueo = await BloqueoHorarioRepository.buscarPorId(id);
    if (!bloqueo) throw Object.assign(new Error("No se encontró el bloqueo."), { statusCode: 404 });
    const profesional = await ProfesionalRepository.buscarPorId(bloqueo.profesional.toString());
    if (!profesional || (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id)) {
      throw Object.assign(new Error("No puedes eliminar este bloqueo."), { statusCode: 403 });
    }
    await bloqueo.deleteOne();
  }
}
