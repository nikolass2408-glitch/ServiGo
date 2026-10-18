import { Document, model, Schema, Types } from "mongoose";
import { TIPOS_NEGOCIO } from "../data/tiposNegocio";

export interface IEmpresa extends Document {
  dueno: Types.ObjectId;
  nombre: string;
  tipoNegocio: string;
  descripcion: string;
  telefono: string;
  direccion: string;
  imagen: string;
  activo: boolean;
}

const empresaSchema = new Schema<IEmpresa>(
  {
    dueno: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    nombre: { type: String, required: true, trim: true },
    tipoNegocio: { type: String, enum: TIPOS_NEGOCIO, default: "OTRO" },
    descripcion: { type: String, default: "" },
    telefono: { type: String, default: "" },
    direccion: { type: String, default: "" },
    imagen: { type: String, default: "" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Empresa = model<IEmpresa>("Empresa", empresaSchema);
