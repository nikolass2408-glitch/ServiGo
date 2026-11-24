import { randomUUID } from "crypto";
import { Response } from "express";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ProfesionalService } from "../services/profesional.service";
import { detectarTipoImagen, tipoPermitido } from "../utils/imageUpload.rules";

const imageDirectory = path.resolve(__dirname, "../../uploads/profiles");

export class ProfileImageController {
  static async upload(req: AuthRequest, res: Response) {
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ error: "Selecciona un archivo de imagen." });
    }

    const tipo = detectarTipoImagen(archivo.buffer);
    if (!tipo || !tipoPermitido(archivo.mimetype, tipo)) {
      return res.status(400).json({ error: "El archivo no es una imagen PNG, JPEG o WebP válida." });
    }
    if (!req.user?.id) {
      return res.status(401).json({ error: "Debes iniciar sesión para subir una imagen." });
    }

    const profesional = await ProfesionalRepository.buscarPorUsuario(req.user.id);
    if (!profesional) {
      return res.status(404).json({ error: "Guarda primero la información de tu negocio." });
    }

    const nombreArchivo = `${randomUUID()}.${tipo}`;
    const destino = path.join(imageDirectory, nombreArchivo);
    await mkdir(imageDirectory, { recursive: true });
    await writeFile(destino, archivo.buffer, { flag: "wx" });

    const imagen = `/uploads/profiles/${nombreArchivo}`;
    try {
      await ProfesionalService.modificar(
        profesional._id.toString(),
        { imagen },
        req.user
      );
    } catch (error) {
      await unlink(destino);
      throw error;
    }

    const imagenAnterior = profesional.imagen || "";
    if (imagenAnterior.startsWith("/uploads/profiles/")) {
      const rutaAnterior = path.join(imageDirectory, path.basename(imagenAnterior));
      if (rutaAnterior !== destino) {
        await unlink(rutaAnterior).catch((error: NodeJS.ErrnoException) => {
          if (error.code !== "ENOENT") {
            console.error("[UPLOAD] No se pudo quitar la imagen anterior:", error);
          }
        });
      }
    }

    return res.json({ imagen });
  }
}
