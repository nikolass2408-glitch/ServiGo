import { Schema, model, Document } from "mongoose";
import { ROLES, Role } from "../data/roles";

export interface IUsuario extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rol: Role;
  telefono?: string;
  createdAt: Date;
  updatedAt: Date;
}

const usuarioSchema = new Schema<IUsuario>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    rol: { type: String, enum: Object.values(ROLES), default: ROLES.CLI },
    telefono: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Usuario = model<IUsuario>("Usuario", usuarioSchema);
