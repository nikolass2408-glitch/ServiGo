import { Servicio } from "../models/Servicio";
import { Profesional } from "../models/Profesional";

export class ServicioRepository {
  static async listarTodos(profesionalId?: string) {
    const profesionalQuery = profesionalId ? { _id: profesionalId, activo: true } : { activo: true };
    const profesionalesActivos = await Profesional.find(profesionalQuery).distinct("_id");
    return Servicio.find({ profesional: { $in: profesionalesActivos } })
      .populate("empresa", "nombre tipoNegocio direccion")
      .lean();
  }
  static buscarPorId(id: string) {
    return Servicio.findById(id);
  }
  static deProfesional(profesionalId: string) {
    return Servicio.find({ profesional: profesionalId }).lean();
  }
  static deProfesionalEnEmpresa(profesionalId: string, empresaId: string) {
    return Servicio.find({ profesional: profesionalId, empresa: empresaId }).lean();
  }
  static crear(data: any) {
    return Servicio.create(data);
  }
  static eliminar(id: string) {
    return Servicio.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );
  }
}
