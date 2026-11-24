import { ProfesionalRepository } from "../repositories/profesional.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ROLES } from "../data/roles";

export class ProfesionalService {
  static async crear(data: any, actor: any) {
    const usuarioId = data.usuario || actor.id;
    const usuario = await UsuarioRepository.buscarPorId(usuarioId);

    if (!usuario) throw Object.assign(new Error("El usuario no existe."), { statusCode: 404 });
    if (actor.rol !== ROLES.ADMIN && actor.id !== usuarioId) {
      throw Object.assign(new Error("Solo puedes crear tu propio perfil profesional."), { statusCode: 403 });
    }
    if (usuario.rol !== ROLES.PRO && actor.rol !== ROLES.ADMIN) {
      throw Object.assign(new Error("El usuario debe tener rol PRO."), { statusCode: 400 });
    }
    if (
      !String(data.nombreNegocio || "").trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(data.enlacePersonalizado || "").trim())
    ) {
      throw Object.assign(new Error("El nombre del negocio y el enlace personalizado son obligatorios."), { statusCode: 400 });
    }

    const existente = await ProfesionalRepository.buscarPorUsuario(usuarioId);
    if (existente) throw Object.assign(new Error("El usuario ya tiene perfil profesional."), { statusCode: 409 });
    const enlaceExistente = await ProfesionalRepository.buscarPorEnlace(data.enlacePersonalizado);
    if (enlaceExistente) throw Object.assign(new Error("El enlace personalizado ya está en uso."), { statusCode: 409 });

    return ProfesionalRepository.crear({
      usuario: usuarioId,
      tipoNegocio: data.tipoNegocio || "OTRO",
      nombreNegocio: data.nombreNegocio,
      descripcion: data.descripcion || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      imagen: data.imagen || "",
      enlacePersonalizado: data.enlacePersonalizado,
      activo: data.activo !== false
    });
  }

  static async modificar(id: string, data: any, actor: any) {
    const profesional = await ProfesionalRepository.buscarPorId(id);
    if (!profesional) {
      throw Object.assign(new Error("El perfil profesional no existe."), { statusCode: 404 });
    }
    if (actor.rol !== ROLES.ADMIN && profesional.usuario.toString() !== actor.id) {
      throw Object.assign(new Error("No puedes modificar este perfil profesional."), { statusCode: 403 });
    }

    const enlace = data.enlacePersonalizado === undefined
      ? profesional.enlacePersonalizado
      : String(data.enlacePersonalizado).trim();
    if (!enlace) {
      throw Object.assign(new Error("El enlace personalizado es obligatorio."), { statusCode: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(enlace)) {
      throw Object.assign(new Error("El enlace solo puede incluir minúsculas, números y guiones."), { statusCode: 400 });
    }
    const enlaceExistente = await ProfesionalRepository.buscarPorEnlace(enlace);
    if (enlaceExistente && enlaceExistente._id.toString() !== id) {
      throw Object.assign(new Error("El enlace personalizado ya está en uso."), { statusCode: 409 });
    }

    const campos = [
      "tipoNegocio",
      "nombreNegocio",
      "descripcion",
      "telefono",
      "direccion",
      "imagen",
      "activo",
    ] as const;
    const cambios: Record<string, unknown> = { enlacePersonalizado: enlace };
    for (const campo of campos) {
      if (data[campo] !== undefined) cambios[campo] = data[campo];
    }
    if (typeof cambios.nombreNegocio === "string") {
      cambios.nombreNegocio = cambios.nombreNegocio.trim();
      if (!cambios.nombreNegocio) {
        throw Object.assign(new Error("El nombre del negocio es obligatorio."), { statusCode: 400 });
      }
    }
    return ProfesionalRepository.actualizar(id, cambios);
  }
}
