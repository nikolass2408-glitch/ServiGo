import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../data/roles";
import { UsuarioRepository } from "../repositories/usuario.repository";

export interface AuthRequest extends Request {
  user?: { id: string; username: string; rol: Role };
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error("JWT_SECRET no configurado"));

  let payload: AuthRequest["user"];
  try {
    payload = jwt.verify(token, secret) as AuthRequest["user"];
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }

  if (!payload?.id || !payload.rol) {
    return res.status(401).json({ error: "Token inválido." });
  }

  try {
    const usuario = await UsuarioRepository.buscarPorId(payload.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: "La cuenta no existe o está desactivada." });
    }
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
