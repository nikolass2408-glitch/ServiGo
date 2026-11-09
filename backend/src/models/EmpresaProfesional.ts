import { Document, model, Schema, Types } from "mongoose";

export interface IEmpresaProfesional extends Document {
  empresa: Types.ObjectId;
  profesional: Types.ObjectId;
  estado: "PENDIENTE" | "ACTIVA";
  invitacionTokenHash: string;
  invitacionExpira: Date;
}

const empresaProfesionalSchema = new Schema<IEmpresaProfesional>(
  {
    empresa: { type: Schema.Types.ObjectId, ref: "Empresa", required: true },
    profesional: { type: Schema.Types.ObjectId, ref: "Profesional", required: true },
    estado: { type: String, enum: ["PENDIENTE", "ACTIVA"], default: "PENDIENTE" },
    invitacionTokenHash: { type: String, required: true, select: false },
    invitacionExpira: { type: Date, required: true, select: false },
  },
  { timestamps: true }
);

empresaProfesionalSchema.index({ empresa: 1, profesional: 1 }, { unique: true });

export const EmpresaProfesional = model<IEmpresaProfesional>(
  "EmpresaProfesional",
  empresaProfesionalSchema
);
