import { Request, Response } from "express";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ProfesionalService } from "../services/profesional.service";
import { ReservaRepository } from "../repositories/reserva.repository";
import { ROLES } from "../data/roles";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ProfesionalController {
  static async listar(req: Request, res: Response) {
    res.json(await ProfesionalRepository.listarTodos());
  }
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await ProfesionalService.crear(req.body, req.user));
  }
  static async clientes(req: AuthRequest, res: Response) {
    const profesional = await ProfesionalRepository.buscarPorId(String(req.params.profesionalId));
    if (!profesional) return res.status(404).json({ error: "Profesional no encontrado." });
    if (req.user?.rol !== ROLES.ADMIN && profesional.usuario.toString() !== req.user?.id) {
      return res.status(403).json({ error: "No tienes permisos para ver estos clientes." });
    }
    const reservas = await ReservaRepository.porProfesional(profesional._id.toString()).distinct("cliente");
    const clientes = await UsuarioRepository.listarTodos();
    const ids = new Set(reservas.map(id => id.toString()));
    res.json(clientes.filter((c:any) => ids.has(c._id.toString())));
  }
}
