import { ServicioRepository } from "../repositories/servicio.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

export class ServicioService {
  static async crear(data: any, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(data.profesional);
    if (!profesional) throw Object.assign(new Error("El profesional no existe."), { statusCode: 404 });

    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes crear servicios para otro profesional."), { statusCode: 403 });
    }

    if (!data.nombre || data.precio === undefined || !data.duracion) {
      throw Object.assign(new Error("Nombre, precio y duración son obligatorios."), { statusCode: 400 });
    }

    return ServicioRepository.crear({
      profesional: profesional._id,
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      precio: Number(data.precio),
      duracion: Number(data.duracion),
      activo: data.activo !== false
    });
  }
}
