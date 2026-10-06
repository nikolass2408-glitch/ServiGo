import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ReservaService } from "../services/reserva.service";
import { ReservaRepository } from "../repositories/reserva.repository";

export class ReservaController {
  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(
      await ReservaService.crear(req.body, req.user)
    );
  }

  static async listar(req: AuthRequest, res: Response) {
    res.json(await ReservaService.listar(req.user));
  }

  static async detalle(req: AuthRequest, res: Response) {
    const reserva: any = await ReservaService.buscar(
      String(req.params.id)
    );

    res.json(reserva);
  }

  static async confirmar(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.confirmar(
        String(req.params.id),
        req.user
      )
    );
  }

  static async completar(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.completar(
        String(req.params.id),
        req.user
      )
    );
  }

  static async cancelar(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.cancelar(
        String(req.params.id),
        req.user
      )
    );
  }

  static async rechazar(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.rechazar(
        String(req.params.id),
        req.user
      )
    );
  }

  static async reprogramar(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.reprogramar(
        String(req.params.id),
        req.body.fecha,
        req.body.hora,
        req.user
      )
    );
  }

  static async historial(req: AuthRequest, res: Response) {
    res.json(await ReservaService.listar(req.user));
  }

  static async disponibilidad(req: AuthRequest, res: Response) {
    res.json(
      await ReservaService.disponibilidad(
        String(req.query.profesional),
        String(req.query.fecha)
      )
    );
  }

  static async historialCliente(req: AuthRequest, res: Response) {
    res.json(
      await ReservaRepository.deClienteConProfesional(
        String(req.params.clienteId),
        String(req.params.profesionalId)
      )
    );
  }
}