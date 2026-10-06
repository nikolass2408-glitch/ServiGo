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

    const existente = await ProfesionalRepository.buscarPorUsuario(usuarioId);
    if (existente) throw Object.assign(new Error("El usuario ya tiene perfil profesional."), { statusCode: 409 });

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
}
