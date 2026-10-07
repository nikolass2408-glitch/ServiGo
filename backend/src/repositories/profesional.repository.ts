import { Profesional } from "../models/Profesional";

export class ProfesionalRepository {
  static listarTodos() {
    return Profesional.find().populate("usuario", "-password").lean();
  }

  static buscarPorId(id: string) {
    return Profesional.findById(id);
  }
  static buscarPorEnlace(enlacePersonalizado: string) {
    return Profesional.findOne({ enlacePersonalizado });
  }

  static buscarPorUsuario(usuarioId: string) {
    return Profesional.findOne({ usuario: usuarioId });
  }

  static crear(data: any) {
    return Profesional.create(data);
  }
  static actualizar(id: string, data: any) {
    return Profesional.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  static contarActivos() {
    return Profesional.countDocuments({ activo: true });
  }
}