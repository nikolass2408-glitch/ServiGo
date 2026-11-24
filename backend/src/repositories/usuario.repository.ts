import { Usuario, IUsuario } from "../models/Usuario";
import { ROLES } from "../data/roles";

export class UsuarioRepository {
  static listarTodos() {
    return Usuario.find().select("-password").lean();
  }
  static buscarPorId(id: string) {
    return Usuario.findById(id).select("-password");
  }
  static actualizarPerfil(id: string, data: Partial<IUsuario>) {
    return Usuario.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password");
  }
  static cambiarEstado(id: string, activo: boolean) {
    return Usuario.findByIdAndUpdate(
      id,
      { activo },
      { new: true, runValidators: true }
    ).select("-password");
  }
  static contar() {
    return Usuario.countDocuments();
  }
  static contarPorRol(rol: string) {
    return Usuario.countDocuments({ rol });
  }
  static buscarPorUsername(username: string, incluirPassword = false) {
    const query = Usuario.findOne({ username });
    return incluirPassword ? query.select("+password") : query;
  }
  static buscarPorEmail(email: string) {
    return Usuario.findOne({ email }).select(
      "+passwordResetTokenHash +passwordResetExpiresAt"
    );
  }
  static consumirTokenRecuperacion(tokenHash: string, passwordHash: string) {
    return Usuario.updateOne(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { password: passwordHash },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
        },
      }
    );
  }
  static clientes() {
    return Usuario.find({ rol: ROLES.CLI }).select("-password");
  }
  static clientesDeProfesional(profesionalId: string) {
    return Usuario.find({
      rol: ROLES.CLI,
      _id: { $in: [] }
    }).select("-password");
  }
  static crear(data: Partial<IUsuario>) {
    return Usuario.create(data);
  }
}
