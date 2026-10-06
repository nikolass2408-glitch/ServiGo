import { Profesional } from "../models/Profesional";

export class ProfesionalRepository {
  static listarTodos() {
    return Profesional.find().populate("usuario", "-password").lean();
  }

  static buscarPorId(id: string) {
    return Profesional.findById(id);
  }

  static buscarPorUsuario(usuarioId: string) {
    return Profesional.findOne({ usuario: usuarioId });
  }

  static crear(data: any) {
    return Profesional.create(data);
  }
}