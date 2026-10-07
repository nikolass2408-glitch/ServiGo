import { Request, Response } from "express";
import { ServicioRepository } from "../repositories/servicio.repository";
import { ServicioService } from "../services/servicio.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

export class ServicioController {
  static async listar(req: Request, res: Response) {
    const { profesional } = req.query;
    const servicios = profesional
      ? await ServicioRepository.deProfesional(String(profesional))
      : await ServicioRepository.listarTodos();
    res.json(servicios.filter((servicio) => servicio.activo));
  }
  static async gestionar(req: AuthRequest, res: Response) {
    const profesionalId = String(req.params.profesionalId);
    const profesional = await ProfesionalRepository.buscarPorId(profesionalId);
    if (!profesional) {
      res.status(404).json({ error: "Profesional no encontrado." });
      return;
    }
    if (
      req.user?.rol !== ROLES.ADMIN &&
      profesional.usuario.toString() !== req.user?.id
    ) {
      res.status(403).json({ error: "No tienes permisos para gestionar estos servicios." });
      return;
    }
    res.json(await ServicioRepository.deProfesional(profesionalId));
  }
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await ServicioService.crear(req.body, req.user));
  }
  static async modificar(req: AuthRequest, res: Response) {
    res.json(await ServicioService.modificar(String(req.params.id), req.body, req.user));
  }
  static async eliminar(req: AuthRequest, res: Response) {
    res.json(await ServicioService.desactivar(String(req.params.id), req.user));
  }
}
