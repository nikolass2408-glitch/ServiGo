import { ROLES } from "../data/roles";
import { ProfesionalRepository } from "../repositories/profesional.repository";
import { ReservaRepository } from "../repositories/reserva.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";

export class AdminService {
  static async resumen() {
    const [usuarios, clientes, profesionales, reservas, citasCompletadas] =
      await Promise.all([
        UsuarioRepository.contar(),
        UsuarioRepository.contarPorRol(ROLES.CLI),
        ProfesionalRepository.contarActivos(),
        ReservaRepository.contar(),
        ReservaRepository.contarCompletadas(),
      ]);

    return { usuarios, clientes, profesionales, reservas, citasCompletadas };
  }
}
