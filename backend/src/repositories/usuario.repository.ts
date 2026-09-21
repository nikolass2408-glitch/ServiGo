import { Usuario, IUsuario } from "../models/Usuario";
import { ROLES } from "../data/roles";

export class UsuarioRepository {
  static listarTodos() {
    return Usuario.find().select("-password").lean();
  }
  static buscarPorId(id: string) {
    return Usuario.findById(id).select("-password");
  }
  static buscarPorUsername(username: string, incluirPassword = false) {
    const query = Usuario.findOne({ username });
    return incluirPassword ? query.select("+password") : query;
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
