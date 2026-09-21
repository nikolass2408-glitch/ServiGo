import { Horario } from "../models/Horario";

export class HorarioRepository {
  static listarTodos() {
    return Horario.find().lean();
  }
  static buscarPorId(id: string) {
    return Horario.findById(id);
  }
  static activosPorDia(profesionalId: string, dia: number) {
    return Horario.find({ profesional: profesionalId, dia, activo: true }).sort({ horaInicio: 1 });
  }
  static existeHorarioValido(profesionalId: string, dia: number, hora: string) {
    return Horario.exists({
      profesional: profesionalId,
      dia,
      activo: true,
      horaInicio: { $lte: hora },
      horaFin: { $gt: hora }
    });
  }
  static crear(data: any) {
    return Horario.create(data);
  }
}
