import { Schema, model, Document, Types } from "mongoose";
import { TIPOS_NEGOCIO } from "../data/tiposNegocio";

export interface IProfesional extends Document {
  usuario: Types.ObjectId;
  tipoNegocio: string;
  nombreNegocio: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
  imagen?: string;
  enlacePersonalizado: string;
  activo: boolean;
}

const profesionalSchema = new Schema<IProfesional>(
  {
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },
    tipoNegocio: { type: String, enum: TIPOS_NEGOCIO, default: "OTRO" },
    nombreNegocio: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    telefono: { type: String, default: "" },
    direccion: { type: String, default: "" },
    imagen: { type: String, default: "" },
    enlacePersonalizado: { type: String, required: true, unique: true, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Profesional = model<IProfesional>("Profesional", profesionalSchema);
