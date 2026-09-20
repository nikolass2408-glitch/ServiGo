import { Servicio } from "../models/Servicio";

export class ServicioRepository {
  static listarTodos() {
    return Servicio.find().lean();
  }
  static buscarPorId(id: string) {
    return Servicio.findById(id);
  }
  static deProfesional(profesionalId: string) {
    return Servicio.find({ profesional: profesionalId }).lean();
  }
  static crear(data: any) {
    return Servicio.create(data);
  }
}
