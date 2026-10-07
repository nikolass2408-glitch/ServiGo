import { ServicioRepository } from "../repositories/servicio.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

export class ServicioService {
  static async crear(data: any, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(data.profesional);
    if (!profesional || !profesional.activo) throw Object.assign(new Error("El profesional no existe o no está disponible."), { statusCode: 404 });

    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes crear servicios para otro profesional."), { statusCode: 403 });
    }

    const precio = Number(data.precio);
    const duracion = Number(data.duracion);
    if (
      !String(data.nombre || "").trim() ||
      data.precio === undefined ||
      !Number.isFinite(precio) ||
      precio < 0 ||
      !Number.isInteger(duracion) ||
      duracion < 1
    ) {
      throw Object.assign(new Error("Nombre, precio y duración son obligatorios."), { statusCode: 400 });
    }

    return ServicioRepository.crear({
      profesional: profesional._id,
      nombre: String(data.nombre).trim(),
      descripcion: data.descripcion || "",
      precio,
      duracion,
      activo: data.activo !== false
    });
  }

  static async modificar(id: string, data: any, actor: any) {
    const servicio = await ServicioRepository.buscarPorId(id);
    if (!servicio) throw Object.assign(new Error("El servicio no existe."), { statusCode: 404 });
    const profesional = await ProfesionalRepository.buscarPorId(servicio.profesional.toString());
    if (!profesional || (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id)) {
      throw Object.assign(new Error("No puedes modificar este servicio."), { statusCode: 403 });
    }

    if (data.nombre !== undefined) {
      const nombre = String(data.nombre).trim();
      if (!nombre) throw Object.assign(new Error("El nombre del servicio es obligatorio."), { statusCode: 400 });
      servicio.nombre = nombre;
    }
    if (data.descripcion !== undefined) servicio.descripcion = String(data.descripcion);
    if (data.precio !== undefined) {
      const precio = Number(data.precio);
      if (!Number.isFinite(precio) || precio < 0) throw Object.assign(new Error("El precio debe ser un número mayor o igual a cero."), { statusCode: 400 });
      servicio.precio = precio;
    }
    if (data.duracion !== undefined) {
      const duracion = Number(data.duracion);
      if (!Number.isInteger(duracion) || duracion < 1) throw Object.assign(new Error("La duración debe ser un número entero positivo."), { statusCode: 400 });
      servicio.duracion = duracion;
    }
    if (data.activo !== undefined) servicio.activo = Boolean(data.activo);
    await servicio.save();
    return servicio;
  }

  static async desactivar(id: string, actor: any) {
    const servicio = await ServicioRepository.buscarPorId(id);
    if (!servicio) throw Object.assign(new Error("El servicio no existe."), { statusCode: 404 });
    const profesional = await ProfesionalRepository.buscarPorId(servicio.profesional.toString());
    if (!profesional || (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id)) {
      throw Object.assign(new Error("No puedes desactivar este servicio."), { statusCode: 403 });
    }
    return ServicioRepository.eliminar(id);
  }
}
