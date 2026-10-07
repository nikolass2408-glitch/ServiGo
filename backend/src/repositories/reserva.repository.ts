import { Reserva } from "../models/Reserva";
import { ESTADOS_RESERVA } from "../data/estadosReserva";

export class ReservaRepository {
  static contar() {
    return Reserva.countDocuments();
  }
  static contarCompletadas() {
    return Reserva.countDocuments({ estado: ESTADOS_RESERVA.COMPLETADA });
  }
  static listarTodas() {
    return Reserva.find()
      .populate("profesional")
      .populate("servicio")
      .populate("cliente", "-password")
      .sort({ fecha: -1, hora: -1 })
      .lean();
  }
  static buscarPorId(id: string) {
    return Reserva.findById(id)
      .populate("profesional")
      .populate("servicio")
      .populate("cliente", "-password");
  }
  static historialOrdenado() {
    return this.listarTodas();
  }
  static porProfesional(profesionalId: string) {
    return Reserva.find({ profesional: profesionalId });
  }
  static deCliente(clienteId: string) {
    return Reserva.find({ cliente: clienteId })
      .sort({ fecha: -1, hora: -1 })
      .populate("profesional servicio")
      .populate("cliente", "-password");
  }
  static deProfesional(profesionalId: string) {
    return Reserva.find({ profesional: profesionalId })
      .sort({ fecha: -1, hora: -1 })
      .populate("profesional servicio")
      .populate("cliente", "-password");
  }
  static deClienteConProfesional(clienteId: string, profesionalId: string) {
    return Reserva.find({ cliente: clienteId, profesional: profesionalId })
      .sort({ fecha: -1, hora: -1 })
      .populate("profesional servicio")
      .populate("cliente", "-password");
  }
  static existeConflicto(profesionalId: string, fecha: string, hora: string, excluirId?: string) {
    const filter: any = {
      profesional: profesionalId,
      fecha,
      hora,
      estado: { $nin: [ESTADOS_RESERVA.CANCELADA, ESTADOS_RESERVA.RECHAZADA] }
    };
    if (excluirId) filter._id = { $ne: excluirId };
    return Reserva.exists(filter);
  }
  static delDiaExcluyendoCanceladas(profesionalId: string, fecha: string) {
    return Reserva.find({
      profesional: profesionalId,
      fecha,
      estado: { $nin: [ESTADOS_RESERVA.CANCELADA, ESTADOS_RESERVA.RECHAZADA] }
    }).populate("servicio").sort({ hora: 1 });
  }
  static proximasActivas(fechaInicio: string, fechaFin: string) {
    return Reserva.find({
      estado: {
        $in: [
          ESTADOS_RESERVA.PENDIENTE,
          ESTADOS_RESERVA.CONFIRMADA,
          ESTADOS_RESERVA.REPROGRAMADA,
        ],
      },
      fecha: { $gte: fechaInicio, $lte: fechaFin },
    })
      .populate("profesional")
      .populate("servicio")
      .populate("cliente", "-password")
      .lean();
  }
  static async existeConflictoPorDuracion(
    profesionalId: string,
    fecha: string,
    hora: string,
    duracionMinutos: number,
    excluirId?: string
  ) {
    const aMinutos = (valor: string) => {
      const [horas, minutos] = valor.split(":").map(Number);
      return horas * 60 + minutos;
    };
    const inicioSolicitado = aMinutos(hora);
    const finSolicitado = inicioSolicitado + duracionMinutos;
    const reservas = await this.delDiaExcluyendoCanceladas(profesionalId, fecha);

    return reservas.some((reserva: any) => {
      if (excluirId && reserva._id.toString() === excluirId) return false;
      const inicioExistente = aMinutos(reserva.hora);
      const finExistente = inicioExistente + Number(reserva.servicio?.duracion || 30);
      return inicioSolicitado < finExistente && finSolicitado > inicioExistente;
    });
  }
  static porProfesionalYEstado(profesionalId: string, estado: string) {
    return Reserva.find({ profesional: profesionalId, estado });
  }
  static completadasConServicio(profesionalId: string) {
    return Reserva.find({ profesional: profesionalId, estado: ESTADOS_RESERVA.COMPLETADA }).populate("servicio");
  }
  static completadasOrdenadas(profesionalId: string) {
    return Reserva.find({ profesional: profesionalId, estado: ESTADOS_RESERVA.COMPLETADA })
      .sort({ fecha: -1, hora: -1 })
      .populate("servicio");
  }
  static crear(data: any) {
    return Reserva.create(data);
  }
}
