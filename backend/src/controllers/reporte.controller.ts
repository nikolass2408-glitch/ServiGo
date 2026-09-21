import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ReporteService } from "../services/reporte.service";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ROLES } from "../data/roles";

async function autorizarProfesional(req: AuthRequest, profesionalId: string) {
  if (req.user?.rol === ROLES.ADMIN) return;
  if (req.user?.rol !== ROLES.PRO) throw Object.assign(new Error("Solo un profesional o administrador puede consultar estadísticas."), { statusCode: 403 });
  const profesional = await ProfesionalRepository.buscarPorId(profesionalId);
  if (!profesional || profesional.usuario.toString() !== req.user.id) {
    throw Object.assign(new Error("No tienes permisos sobre estas estadísticas."), { statusCode: 403 });
  }
}

export class ReporteController {
  static async resumen(req: AuthRequest, res: Response) {
    await autorizarProfesional(req, String(req.params.profesionalId));
    res.json(await ReporteService.resumenReservas(String(req.params.profesionalId)));
  }
  static async servicios(req: AuthRequest, res: Response) {
    await autorizarProfesional(req, String(req.params.profesionalId));
    res.json(await ReporteService.serviciosMasSolicitados(String(req.params.profesionalId)));
  }
  static async completadas(req: AuthRequest, res: Response) {
    await autorizarProfesional(req, String(req.params.profesionalId));
    res.json(await ReporteService.citasCompletadas(String(req.params.profesionalId)));
  }
  static async ingresos(req: AuthRequest, res: Response) {
    await autorizarProfesional(req, String(req.params.profesionalId));
    res.json(await ReporteService.ingresosEstimados(String(req.params.profesionalId)));
  }
}
