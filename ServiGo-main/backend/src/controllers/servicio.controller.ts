import { Request, Response } from "express";
import { ServicioRepository } from "../repositories/servicio.repository";
import { ServicioService } from "../services/servicio.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ServicioController {
  static async listar(req: Request, res: Response) {
    const { profesional } = req.query;
    res.json(profesional ? await ServicioRepository.deProfesional(String(profesional)) : await ServicioRepository.listarTodos());
  }
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await ServicioService.crear(req.body, req.user));
  }
}
