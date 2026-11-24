import { Request, Response, NextFunction } from "express";
import multer from "multer";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada." });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "La imagen debe pesar 5 MB o menos." });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ error: "Ya existe un registro con uno de los datos únicos enviados." });
  }

  res.status(err?.statusCode || 500).json({
    error: err?.message || "Error interno del servidor."
  });
}
