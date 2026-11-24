import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { BloqueoHorarioService } from "../services/bloqueoHorario.service";

export class BloqueoHorarioController {
  static async listar(req: AuthRequest, res: Response) {
    res.json(
      await BloqueoHorarioService.listar(
        String(req.query.profesional || ""),
        req.user
      )
    );
  }
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await BloqueoHorarioService.crear(req.body, req.user));
  }
  static async eliminar(req: AuthRequest, res: Response) {
    await BloqueoHorarioService.eliminar(String(req.params.id), req.user);
    res.status(204).end();
  }
}
