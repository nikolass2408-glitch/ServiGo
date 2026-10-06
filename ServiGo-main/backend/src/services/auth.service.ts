import bcrypt from "bcryptjs";
import { crearPasswordResetToken, hashPasswordResetToken } from "./passwordReset.rules";
import jwt from "jsonwebtoken";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ROLES, Role } from "../data/roles";
import { MailService } from "./mail.service";

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
    if (!usuario.activo) {
      throw Object.assign(new Error("La cuenta está desactivada."), { statusCode: 403 });
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

  static async solicitarRecuperacionPassword(email: unknown) {
    const correo = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!correo) return;

    const usuario = await UsuarioRepository.buscarPorEmail(correo);
    if (!usuario) return;

    const reset = crearPasswordResetToken();
    usuario.passwordResetTokenHash = reset.tokenHash;
    usuario.passwordResetExpiresAt = reset.expiresAt;
    await usuario.save();

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173")
      .replace(/\/+$/, "");
    const url = `${frontendUrl}/recuperar-password?token=${encodeURIComponent(reset.token)}`;
    const nombre = `${usuario.firstName || ""} ${usuario.lastName || ""}`.trim();

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.PASSWORD_RESET_LOG_LINK === "true"
      ) {
        console.info(`[PASSWORD RESET DEV] ${url}`);
      } else {
        console.warn("[MAIL] SMTP sin configurar; no se pudo entregar el enlace de recuperación.");
      }
      return;
    }

    try {
      await MailService.enviarEnlaceRecuperacion(usuario.email, nombre, url);
    } catch (error) {
      console.error("[MAIL ERROR] No se pudo enviar el enlace de recuperación:", error);
    }
  }

  static async restablecerPassword(token: unknown, password: unknown) {
    if (typeof token !== "string" || !token || typeof password !== "string") {
      throw Object.assign(new Error("El enlace es inválido o venció."), { statusCode: 400 });
    }

    this.validarPassword(password);

    const resultado = await UsuarioRepository.consumirTokenRecuperacion(
      hashPasswordResetToken(token),
      await bcrypt.hash(password, 12)
    );
    if (resultado.modifiedCount !== 1) {
      throw Object.assign(new Error("El enlace es inválido o venció."), { statusCode: 400 });
    }
  }

  static publicUser(usuario: any) {
    return {
      id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      rol: usuario.rol,
      telefono: usuario.telefono,
      activo: usuario.activo
    };
  }

  static async actualizarPerfil(usuarioId: string, data: any) {
    const firstName = String(data.firstName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const telefono = String(data.telefono || "").trim();
    if (!firstName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw Object.assign(new Error("Nombre y correo electrónico válido son obligatorios."), {
        statusCode: 400,
      });
    }

    const usuario = await UsuarioRepository.actualizarPerfil(usuarioId, {
      firstName,
      lastName,
      email,
      username: email,
      telefono,
    });
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado."), { statusCode: 404 });
    }
    return this.publicUser(usuario);
  }

  static async cambiarEstado(
    usuarioId: string,
    activo: unknown,
    actorId: string
  ) {
    if (typeof activo !== "boolean") {
      throw Object.assign(new Error("El estado debe ser activo o inactivo."), {
        statusCode: 400,
      });
    }
    if (usuarioId === actorId && !activo) {
      throw Object.assign(new Error("No puedes desactivar tu propia cuenta."), {
        statusCode: 400,
      });
    }
    const usuario = await UsuarioRepository.cambiarEstado(usuarioId, activo);
    if (!usuario) {
      throw Object.assign(new Error("Usuario no encontrado."), { statusCode: 404 });
    }
    return this.publicUser(usuario);
  }
}
