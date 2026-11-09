import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ProfesionalService } from "../services/profesional.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AuthController {
  static async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarios = await UsuarioRepository.listarTodos();
      res.json(usuarios);
    } catch (error: any) {
      console.error(">>> ERROR AL LISTAR USUARIOS:", error);
      res.status(500).json({ error: "Error interno al obtener la lista de usuarios." });
    }
  }

  static async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevoUsuario = await AuthService.registrar(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error: any) {
      console.error(">>> ERROR REAL EN REGISTRO:", error);

  
      if (error.code === 11000) {
        const campoDuplicado = Object.keys(error.keyValue || {})[0] || "campo";
        res.status(400).json({
          error: `El ${campoDuplicado} ya se encuentra registrado.`
        });
        return;
      }

      res.status(400).json({
        error: error.message || "No fue posible registrar el usuario."
      });
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username y password son obligatorios." });
        return;
      }

      const respuestaLogin = await AuthService.login(username, password);
      res.json(respuestaLogin);
    } catch (error: any) {
      console.error(">>> ERROR EN LOGIN:", error);
      res.status(401).json({
        error: error.message || "Credenciales inválidas."
      });
    }
  }

  static async solicitarRecuperacion(req: Request, res: Response) {
    await AuthService.solicitarRecuperacionPassword(req.body?.email);
    res.json({
      message: "Si el correo pertenece a una cuenta, recibirás un enlace para restablecer la contraseña.",
    });
  }

  static async restablecerPassword(req: Request, res: Response) {
    await AuthService.restablecerPassword(req.body?.token, req.body?.password);
    res.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
  }

  static async perfil(req: AuthRequest, res: Response) {
    const usuario = await UsuarioRepository.buscarPorId(String(req.user?.id));
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }
    const profesional = usuario.rol === "PRO"
      ? await ProfesionalRepository.buscarPorUsuario(usuario._id.toString())
      : null;
    res.json({
      usuario: AuthService.publicUser(usuario),
      profesional,
    });
  }

  static async modificarPerfil(req: AuthRequest, res: Response) {
    const usuarioId = String(req.user?.id);
    const usuario = await AuthService.actualizarPerfil(usuarioId, req.body || {});
    let profesional = null;
    if (req.body?.profesional) {
      const existente = await ProfesionalRepository.buscarPorUsuario(usuarioId);
      profesional = existente
        ? await ProfesionalService.modificar(
            existente._id.toString(),
            req.body.profesional,
            req.user
          )
        : await ProfesionalService.crear(req.body.profesional, req.user);
    } else if (req.user?.rol === "PRO") {
      profesional = await ProfesionalRepository.buscarPorUsuario(usuarioId);
    }
    res.json({ usuario, profesional });
  }

  static async cambiarEstadoUsuario(req: AuthRequest, res: Response) {
    res.json(
      await AuthService.cambiarEstado(
        String(req.params.id),
        req.body?.activo,
        String(req.user?.id)
      )
    );
  }
}