import { Schema, model, Document, Types } from "mongoose";

export interface IServicio extends Document {
  profesional: Types.ObjectId;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  activo: boolean;
}

const servicioSchema = new Schema<IServicio>(
  {
    profesional: { type: Schema.Types.ObjectId, ref: "Profesional", required: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    precio: { type: Number, required: true, min: 0 },
    duracion: { type: Number, required: true, min: 1 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Servicio = model<IServicio>("Servicio", servicioSchema);
