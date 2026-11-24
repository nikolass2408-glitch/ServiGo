import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AdminService } from "../services/admin.service";

export class AdminController {
  static async resumen(_req: AuthRequest, res: Response) {
    res.json(await AdminService.resumen());
  }
}
