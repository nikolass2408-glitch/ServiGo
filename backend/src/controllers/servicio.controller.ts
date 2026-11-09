import { Request, Response } from "express";
import { ServicioRepository } from "../repositories/servicio.repository";
import { ServicioService } from "../services/servicio.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";
import { EmpresaService } from "../services/empresa.service";

export class ServicioController {
  static async listar(req: Request, res: Response) {
    const { profesional } = req.query;
    const servicios = await ServicioRepository.listarTodos(
      profesional ? String(profesional) : undefined
    );
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
      profesional.usuario.toString() !== req.user?.id &&
      !(req.user?.rol === ROLES.DUENO && req.query.empresa &&
        await EmpresaService.esMiembroActivo(String(req.user?.id), String(req.query.empresa), profesionalId))
    ) {
      res.status(403).json({ error: "No tienes permisos para gestionar estos servicios." });
      return;
    }
    if (req.user?.rol === ROLES.DUENO) {
      res.json(await ServicioRepository.deProfesionalEnEmpresa(
        profesionalId,
        String(req.query.empresa)
      ));
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
