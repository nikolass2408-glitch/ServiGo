import { Schema, model, Document, Types } from "mongoose";
import { ESTADOS_RESERVA, EstadoReserva } from "../data/estadosReserva";

export interface IReserva extends Document {
  profesional: Types.ObjectId;
  servicio: Types.ObjectId;
  cliente: Types.ObjectId;
  fecha: string;
  hora: string;
  estado: EstadoReserva;
  notas?: string;
  creadaEn: Date;
  actualizadaEn: Date;
}

const reservaSchema = new Schema<IReserva>(
  {
    profesional: { type: Schema.Types.ObjectId, ref: "Profesional", required: true },
    servicio: { type: Schema.Types.ObjectId, ref: "Servicio", required: true },
    cliente: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    estado: { type: String, enum: Object.values(ESTADOS_RESERVA), default: ESTADOS_RESERVA.PENDIENTE },
    notas: { type: String, default: "" },
  },
  { timestamps: { createdAt: "creadaEn", updatedAt: "actualizadaEn" } }
);

reservaSchema.index({ profesional: 1, fecha: 1, hora: 1 });

export const Reserva = model<IReserva>("Reserva", reservaSchema);
