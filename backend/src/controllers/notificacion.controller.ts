import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { NotificacionService } from "../services/notificacion.service";

export class NotificacionController {
  static async informacionCliente(req: AuthRequest, res: Response) {
    const usuario = await UsuarioRepository.buscarPorId(String(req.params.id));
    if (!usuario) return res.status(404).json({ error: "Cliente no encontrado." });
    if (req.user?.rol !== "ADMIN" && req.user?.id !== req.params.id) {
      return res.status(403).json({ error: "No tienes permisos para ver esta información." });
    }
    res.json(usuario);
  }
  static async listar(req: AuthRequest, res: Response) {
    res.json(await NotificacionService.listar(String(req.params.usuarioId), req.user));
  }
  static async recordatorio(req: AuthRequest, res: Response) {
    const reserva = await NotificacionService.enviarRecordatorio(String(req.params.id), req.user);
    res.json({ mensaje: "Recordatorio enviado correctamente.", reserva: reserva._id });
  }
}
