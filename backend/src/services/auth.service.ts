import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ROLES, Role } from "../data/roles";

export class AuthService {
  static validarPassword(password: string) {
    if (typeof password !== "string" || password.length < 8) {
      throw Object.assign(new Error("La contraseña debe tener mínimo 8 caracteres."), { statusCode: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      throw Object.assign(new Error("La contraseña debe incluir mayúscula, minúscula y número."), { statusCode: 400 });
    }
  }

  // Traduce lo que manda el frontend ("profesional", "PRO", etc.) al rol del sistema.
  // Nunca permite crear un ADMIN desde el registro público.
  static normalizarRol(rol: any): Role {
    const r = String(rol || "").trim().toUpperCase();
    if (["PRO", "PROF", "PROFESIONAL", "PRESTADOR"].includes(r)) return ROLES.PRO;
    return ROLES.CLI;
  }

  static async registrar(data: any) {
    this.validarPassword(data.password);

    if (!data.username || !data.email) {
      throw Object.assign(new Error("Username y email son obligatorios."), { statusCode: 400 });
    }

    const existeUsername = await UsuarioRepository.buscarPorUsername(data.username);
    if (existeUsername) throw Object.assign(new Error("El username ya está registrado."), { statusCode: 409 });

    const password = await bcrypt.hash(data.password, 12);

    const rol: Role = this.normalizarRol(data.rol);

    // Si el frontend manda "nombre" completo, lo separamos en nombre y apellido
    const [primerNombre, ...resto] = String(data.nombre || "").trim().split(/\s+/);

    const usuario = await UsuarioRepository.crear({
      username: data.username,
      email: data.email,
      password,
      firstName: data.firstName || primerNombre || "",
      lastName: data.lastName || resto.join(" "),
      rol,
      telefono: data.telefono || ""
    });

    return this.publicUser(usuario);
  }

  static async login(username: string, password: string) {
    const usuario = await UsuarioRepository.buscarPorUsername(username, true);
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      throw Object.assign(new Error("Usuario o contraseña incorrectos."), { statusCode: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no configurado.");

    const token = jwt.sign(
      { id: usuario._id.toString(), username: usuario.username, rol: usuario.rol },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "2h") as jwt.SignOptions["expiresIn"] }
    );

    return { token, usuario: this.publicUser(usuario) };
  }

  static publicUser(usuario: any) {
    return {
      id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      rol: usuario.rol,
      telefono: usuario.telefono
    };
  }
}
