import { Request, Response } from "express";
import { HorarioService } from "../services/horario.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class HorarioController {
  static async listar(_req: Request, res: Response): Promise<void> {
    try {
      const horarios = await HorarioService.listar();
      res.status(200).json(horarios);
    } catch {
      res.status(500).json({
        mensaje: "Error al obtener la lista de horarios",
      });
    }
  }

  static async obtenerPorId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const horario = await HorarioService.obtenerPorId(String(req.params.id));
      if (!horario) {
        res.status(404).json({ mensaje: "Horario no encontrado" });
        return;
      }
      res.status(200).json(horario);
    } catch {
      res.status(500).json({ mensaje: "Error al obtener el horario" });
    }
  }

  static async crear(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return;
    }
    try {
      const horario = await HorarioService.crear(req.body, req.user);
      res.status(201).json(horario);
    } catch {
      res.status(500).json({ mensaje: "Error al crear el horario" });
    }
  }

  static async modificar(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return;
    }
    try {
      const horario = await HorarioService.modificar(
        String(req.params.id),
        req.body,
        req.user
      );
      res.status(200).json(horario);
    } catch {
      res.status(500).json({ mensaje: "Error al modificar el horario" });
    }
  }

  static async eliminar(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return;
    }
    try {
      await HorarioService.eliminar(String(req.params.id), req.user);
      res.status(200).json({
        mensaje: "Horario eliminado correctamente",
      });
    } catch {
      res.status(500).json({ mensaje: "Error al eliminar el horario" });
    }
  }
}