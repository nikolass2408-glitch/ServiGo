import { Profesional } from "../models/Profesional";
import { Reserva } from "../models/Reserva";
import { ESTADOS_RESERVA } from "../data/estadosReserva";

export class ProfesionalRepository {
  static async listarTodos() {
    const [profesionales, calificaciones] = await Promise.all([
      Profesional.find().populate("usuario", "-password").lean(),
      Reserva.aggregate([
        {
          $match: {
            estado: ESTADOS_RESERVA.COMPLETADA,
            calificacion: { $gte: 1, $lte: 5 },
          },
        },
        {
          $group: {
            _id: "$profesional",
            promedio: { $avg: "$calificacion" },
            cantidad: { $sum: 1 },
          },
        },
      ]),
    ]);
    const porProfesional = new Map(
      calificaciones.map((item) => [String(item._id), item]),
    );

    return profesionales.map((profesional) => {
      const calificacion = porProfesional.get(String(profesional._id));
      const esCuentaDemo = profesional.usuario?.email?.endsWith("@servigo.test");
      const tieneCalificacionesReales = Boolean(calificacion?.cantidad);
      return {
        ...profesional,
        especialidad: profesional.especialidad || "",
        calificacionPromedio: tieneCalificacionesReales
          ? calificacion.promedio
          : esCuentaDemo
            ? profesional.calificacionDemo || 0
            : 0,
        totalCalificaciones: tieneCalificacionesReales
          ? calificacion.cantidad
          : esCuentaDemo
            ? profesional.totalCalificacionesDemo || 0
            : 0,
      };
    });
  }

  static buscarPorId(id: string) {
    return Profesional.findById(id);
  }
  static buscarPorEnlace(enlacePersonalizado: string) {
    return Profesional.findOne({ enlacePersonalizado });
  }

  static buscarPorUsuario(usuarioId: string) {
    return Profesional.findOne({ usuario: usuarioId });
  }

  static crear(data: any) {
    return Profesional.create(data);
  }
  static actualizar(id: string, data: any) {
    return Profesional.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }
  static contarActivos() {
    return Profesional.countDocuments({ activo: true });
  }
}