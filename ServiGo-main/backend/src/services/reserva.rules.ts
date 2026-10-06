import { ESTADOS_RESERVA } from "../data/estadosReserva";

type AccionReserva = "confirmar" | "cancelar" | "reprogramar";

const ESTADOS_MODIFICABLES = [
  ESTADOS_RESERVA.PENDIENTE,
  ESTADOS_RESERVA.CONFIRMADA,
];

export function validarAccionReserva(estado: string, accion: AccionReserva) {
  const puedeConfirmar =
    accion === "confirmar" && estado === ESTADOS_RESERVA.PENDIENTE;
  const puedeModificar =
    ["cancelar", "reprogramar"].includes(accion) &&
    ESTADOS_MODIFICABLES.includes(estado as (typeof ESTADOS_MODIFICABLES)[number]);

  if (puedeConfirmar || puedeModificar) return;

  throw Object.assign(
    new Error("La cita ya no permite esta acción por su estado actual."),
    { statusCode: 409 }
  );
}

export function validarPropiedadReserva(clienteId: string, usuarioId: string) {
  if (clienteId !== usuarioId) {
    throw Object.assign(new Error("No puedes modificar una reserva ajena."), {
      statusCode: 403,
    });
  }
}

export function validarPropiedadProfesionalReserva(
  reservaProfesionalId: string,
  profesionalId: string
) {
  if (reservaProfesionalId !== profesionalId) {
    throw Object.assign(
      new Error("No puedes modificar una reserva de otro prestador."),
      { statusCode: 403 }
    );
  }
}

export function validarHorarioDisponible(existeConflicto: boolean) {
  if (existeConflicto) {
    throw Object.assign(
      new Error("El nuevo horario seleccionado no está disponible."),
      { statusCode: 409 }
    );
  }
}

export function validarFechaHoraReserva(
  fecha: string,
  hora: string,
  ahora = new Date()
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    throw Object.assign(new Error("Selecciona una fecha y hora válidas."), {
      statusCode: 400,
    });
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  const fechaHora = new Date(anio, mes - 1, dia, horas, minutos);
  if (
    Number.isNaN(fechaHora.getTime()) ||
    fechaHora.getFullYear() !== anio ||
    fechaHora.getMonth() !== mes - 1 ||
    fechaHora.getDate() !== dia ||
    fechaHora.getHours() !== Number(hora.slice(0, 2)) ||
    fechaHora.getMinutes() !== Number(hora.slice(3, 5))
  ) {
    throw Object.assign(new Error("Selecciona una fecha y hora válidas."), {
      statusCode: 400,
    });
  }

  if (fechaHora <= ahora) {
    throw Object.assign(new Error("La nueva fecha debe ser futura."), {
      statusCode: 400,
    });
  }
}