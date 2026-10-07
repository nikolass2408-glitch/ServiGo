import { Schema, model, Document, Types } from "mongoose";

export interface IBloqueoHorario extends Document {
  profesional: Types.ObjectId;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}

const bloqueoHorarioSchema = new Schema<IBloqueoHorario>(
  {
    profesional: { type: Schema.Types.ObjectId, ref: "Profesional", required: true },
    fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    horaInicio: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    horaFin: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    motivo: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

bloqueoHorarioSchema.index({ profesional: 1, fecha: 1 });

export const BloqueoHorario = model<IBloqueoHorario>(
  "BloqueoHorario",
  bloqueoHorarioSchema
);
