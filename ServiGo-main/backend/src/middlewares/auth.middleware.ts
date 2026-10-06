import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../data/roles";

export interface AuthRequest extends Request {
  user?: { id: string; username: string; rol: Role };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido." });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET no configurado");

    const payload = jwt.verify(token, secret) as AuthRequest["user"];
    if (!payload?.id || !payload.rol) {
      return res.status(401).json({ error: "Token inválido." });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}
