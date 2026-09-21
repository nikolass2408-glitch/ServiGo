import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UsuarioRepository } from "../repositories/usuario.repository";

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
}