import { Schema, model, Document, Types } from "mongoose";

export interface IHorario extends Document {
  profesional: Types.ObjectId;
  dia: number;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

const horarioSchema = new Schema<IHorario>(
  {
    profesional: { type: Schema.Types.ObjectId, ref: "Profesional", required: true },
    dia: { type: Number, required: true, min: 0, max: 6 },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Horario = model<IHorario>("Horario", horarioSchema);
