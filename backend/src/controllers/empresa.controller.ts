import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { EmpresaService } from "../services/empresa.service";

export class EmpresaController {
  static async panel(req: AuthRequest, res: Response) {
    res.json(await EmpresaService.obtenerPanel(String(req.user?.id)));
  }

  static async crear(req: AuthRequest, res: Response) {
    res.status(201).json(await EmpresaService.crearEmpresa(String(req.user?.id), req.body));
  }

  static async invitarProfesional(req: AuthRequest, res: Response) {
    res.status(201).json(await EmpresaService.invitarProfesional(
      String(req.user?.id),
      String(req.params.empresaId),
      req.body
    ));
  }

  static async aceptarInvitacion(req: Request, res: Response) {
    await EmpresaService.aceptarInvitacion(req.body?.token, req.body?.password);
    res.json({ message: "Cuenta activada. Ya puedes iniciar sesión." });
  }

  static async detalleInvitacion(req: Request, res: Response) {
    res.json(await EmpresaService.detalleInvitacion(req.params.token));
  }
}
