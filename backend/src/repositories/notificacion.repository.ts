import { Notificacion } from "../models/Notificacion";

export class NotificacionRepository {
  static crear(data: any) {
    return Notificacion.create(data);
  }
  static porUsuario(usuarioId: string) {
    return Notificacion.find({ usuario: usuarioId }).sort({ creadaEn: -1 }).lean();
  }
}
