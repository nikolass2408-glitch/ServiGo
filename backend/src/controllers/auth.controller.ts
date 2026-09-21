import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UsuarioRepository } from "../repositories/usuario.repository";

export class AuthController {
  static async listarUsuarios(req: Request, res: Response) {
    res.json(await UsuarioRepository.listarTodos());
  }
  static async registrar(req: Request, res: Response) {
    res.status(201).json(await AuthService.registrar(req.body));
  }
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username y password son obligatorios." });
    res.json(await AuthService.login(username, password));
  }
}
