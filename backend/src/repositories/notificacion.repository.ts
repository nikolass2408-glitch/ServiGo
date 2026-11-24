import { Notificacion } from "../models/Notificacion";

export class NotificacionRepository {
  static crear(data: any) {
    return Notificacion.create(data);
  }
  static porUsuario(usuarioId: string) {
    return Notificacion.find({ usuario: usuarioId }).sort({ creadaEn: -1 }).lean();
  }
  static async crearRecordatorioAutomatico(data: any) {
    try {
      return await Notificacion.create(data);
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.claveAutomatica) {
        return null;
      }
      throw error;
    }
  }
}
