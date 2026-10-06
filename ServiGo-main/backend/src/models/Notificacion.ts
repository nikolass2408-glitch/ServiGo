import { Schema, model, Document, Types } from "mongoose";
import { TIPOS_NOTIFICACION, TipoNotificacion } from "../data/tiposNotificacion";

export interface INotificacion extends Document {
  usuario: Types.ObjectId;
  reserva?: Types.ObjectId;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  creadaEn: Date;
}

const notificacionSchema = new Schema<INotificacion>(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    reserva: { type: Schema.Types.ObjectId, ref: "Reserva" },
    tipo: { type: String, enum: Object.values(TIPOS_NOTIFICACION), required: true },
    mensaje: { type: String, required: true },
    leida: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "creadaEn", updatedAt: false } }
);

export const Notificacion = model<INotificacion>("Notificacion", notificacionSchema);
