import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { Role } from "../data/roles";

export function authorizeRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado." });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos para esta operación." });
    }
    next();
  };
}
