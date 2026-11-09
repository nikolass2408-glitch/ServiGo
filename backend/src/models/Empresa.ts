import { Document, model, Schema, Types } from "mongoose";
import { TIPOS_NEGOCIO } from "../data/tiposNegocio";
import { DiaHorarioEmpresa, HorarioEmpresa } from "../services/empresa.horario";

export interface IEmpresa extends Document {
  dueno: Types.ObjectId;
  nombre: string;
  tipoNegocio: string;
  descripcion: string;
  telefono: string;
  direccion: string;
  imagen: string;
  horarioEmpresa?: HorarioEmpresa;
  activo: boolean;
}

const diaHorarioEmpresaSchema = new Schema<DiaHorarioEmpresa>(
  {
    dia: { type: Number, required: true, min: 0, max: 6 },
    abierto: { type: Boolean, required: true },
    horaInicio: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    horaFin: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  },
  { _id: false }
);

const horarioEmpresaSchema = new Schema<HorarioEmpresa>(
  {
    abierto24Horas: { type: Boolean, required: true, default: false },
    dias: { type: [diaHorarioEmpresaSchema], required: true },
  },
  { _id: false }
);

const empresaSchema = new Schema<IEmpresa>(
  {
    dueno: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    nombre: { type: String, required: true, trim: true },
    tipoNegocio: { type: String, enum: TIPOS_NEGOCIO, default: "OTRO" },
    descripcion: { type: String, default: "" },
    telefono: { type: String, default: "" },
    direccion: { type: String, default: "" },
    imagen: { type: String, default: "" },
    horarioEmpresa: { type: horarioEmpresaSchema, default: undefined },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Empresa = model<IEmpresa>("Empresa", empresaSchema);
