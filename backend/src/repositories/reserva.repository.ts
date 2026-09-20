import { Reserva } from "../models/Reserva";
import { ESTADOS_RESERVA } from "../data/estadosReserva";

export class ReservaRepository {
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
    }).sort({ hora: 1 });
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
