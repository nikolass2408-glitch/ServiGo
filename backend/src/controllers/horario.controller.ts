import { Request, Response } from "express";
import { HorarioRepository } from "../repositories/horario.repository";
import { HorarioService } from "../services/horario.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class HorarioController {
  static async listar(req: Request, res: Response) {
    res.json(await HorarioRepository.listarTodos());
  }
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await HorarioService.crear(req.body, req.user));
  }
  static async modificar(req: AuthRequest, res: Response) {
    res.json(await HorarioService.modificar(String(req.params.id), req.body, req.user));
  }
}
