import { BloqueoHorario, IBloqueoHorario } from "../models/BloqueoHorario";

export class BloqueoHorarioRepository {
  static listarPorProfesional(profesionalId: string) {
    return BloqueoHorario.find({ profesional: profesionalId })
      .sort({ fecha: 1, horaInicio: 1 })
      .lean();
  }
  static buscarPorId(id: string) {
    return BloqueoHorario.findById(id);
  }
  static solapado(
    profesionalId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) {
    return BloqueoHorario.exists({
      profesional: profesionalId,
      fecha,
      horaInicio: { $lt: horaFin },
      horaFin: { $gt: horaInicio },
    });
  }
  static existeSolapamiento(
    profesionalId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) {
    return BloqueoHorario.exists({
      profesional: profesionalId,
      fecha,
      horaInicio: { $lt: horaFin },
      horaFin: { $gt: horaInicio },
    });
  }
  static crear(data: Partial<IBloqueoHorario>) {
    return BloqueoHorario.create(data);
  }
}
