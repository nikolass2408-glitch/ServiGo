import { HorarioRepository } from "../repositories/horario.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

function validarHorario(dia: number, horaInicio: string, horaFin: string) {
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) throw Object.assign(new Error("El día debe estar entre 0 y 6."), { statusCode: 400 });
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(horaInicio) || !/^\d{2}:\d{2}(:\d{2})?$/.test(horaFin)) {
    throw Object.assign(new Error("Las horas deben tener formato HH:MM o HH:MM:SS."), { statusCode: 400 });
  }
  if (horaInicio >= horaFin) throw Object.assign(new Error("La hora de inicio debe ser menor que la hora de fin."), { statusCode: 400 });
}

export class HorarioService {
  static async crear(data: any, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(data.profesional);
    if (!profesional) throw Object.assign(new Error("El profesional no existe."), { statusCode: 404 });
    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes crear horarios para otro profesional."), { statusCode: 403 });
    }

    validarHorario(Number(data.dia), data.horaInicio, data.horaFin);
    return HorarioRepository.crear({
      profesional: profesional._id,
      dia: Number(data.dia),
      horaInicio: data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio,
      horaFin: data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin,
      activo: data.activo !== false
    });
  }

  static async modificar(id: string, data: any, actor: any) {
    const horario = await HorarioRepository.buscarPorId(id);
    if (!horario) throw Object.assign(new Error("El horario no existe."), { statusCode: 404 });

    const profesional = await ProfesionalRepository.buscarPorId(horario.profesional.toString());
    if (!profesional) throw Object.assign(new Error("El profesional no existe."), { statusCode: 404 });
    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes modificar este horario."), { statusCode: 403 });
    }

    if (data.dia !== undefined || data.horaInicio || data.horaFin) {
      const dia = data.dia !== undefined ? Number(data.dia) : horario.dia;
      const inicio = data.horaInicio || horario.horaInicio;
      const fin = data.horaFin || horario.horaFin;
      validarHorario(dia, inicio, fin);
      horario.dia = dia;
      horario.horaInicio = inicio.length === 5 ? `${inicio}:00` : inicio;
      horario.horaFin = fin.length === 5 ? `${fin}:00` : fin;
    }
    if (data.activo !== undefined) horario.activo = Boolean(data.activo);

    await horario.save();
    return horario;
  }
}
