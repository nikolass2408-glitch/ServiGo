import assert from "node:assert/strict";
import test from "node:test";
import { ESTADOS_RESERVA } from "../data/estadosReserva";
import {
  validarAccionReserva,
  validarFechaHoraReserva,
  validarHorarioDisponible,
  validarPropiedadReserva,
  validarPropiedadProfesionalReserva,
} from "./reserva.rules";

test("permite confirmar una cita pendiente", () => {
  assert.doesNotThrow(() =>
    validarAccionReserva(ESTADOS_RESERVA.PENDIENTE, "confirmar")
  );
});

test("impide confirmar una cita que ya no está pendiente", () => {
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.CONFIRMADA, "confirmar"),
    { statusCode: 409 }
  );
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.CANCELADA, "confirmar"),
    { statusCode: 409 }
  );
});

test("permite cancelar citas pendientes o confirmadas", () => {
  assert.doesNotThrow(() =>
    validarAccionReserva(ESTADOS_RESERVA.PENDIENTE, "cancelar")
  );
  assert.doesNotThrow(() =>
    validarAccionReserva(ESTADOS_RESERVA.CONFIRMADA, "cancelar")
  );
});

test("impide cancelar una cita terminal", () => {
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.CANCELADA, "cancelar"),
    { statusCode: 409 }
  );
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.COMPLETADA, "cancelar"),
    { statusCode: 409 }
  );
});

test("permite reprogramar citas activas", () => {
  assert.doesNotThrow(() =>
    validarAccionReserva(ESTADOS_RESERVA.PENDIENTE, "reprogramar")
  );
  assert.doesNotThrow(() =>
    validarAccionReserva(ESTADOS_RESERVA.CONFIRMADA, "reprogramar")
  );
});

test("impide reprogramar citas canceladas o completadas", () => {
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.CANCELADA, "reprogramar"),
    { statusCode: 409 }
  );
  assert.throws(
    () => validarAccionReserva(ESTADOS_RESERVA.COMPLETADA, "reprogramar"),
    { statusCode: 409 }
  );
});

test("acepta una fecha y hora futuras válidas", () => {
  assert.doesNotThrow(() =>
    validarFechaHoraReserva("2026-10-06", "10:30", new Date("2026-10-05T09:00:00"))
  );
});

test("rechaza una fecha anterior o igual al momento actual", () => {
  const ahora = new Date("2026-10-05T09:00:00");
  assert.throws(() => validarFechaHoraReserva("2026-10-05", "08:59", ahora), {
    statusCode: 400,
  });
  assert.throws(() => validarFechaHoraReserva("2026-10-05", "09:00", ahora), {
    statusCode: 400,
  });
});

test("rechaza fechas inexistentes y formatos inválidos", () => {
  const ahora = new Date("2026-10-05T09:00:00");
  assert.throws(() => validarFechaHoraReserva("2026-02-30", "10:30", ahora), {
    statusCode: 400,
  });
  assert.throws(() => validarFechaHoraReserva("2026-10-06", "25:00", ahora), {
    statusCode: 400,
  });
});

test("permite modificar una reserva del cliente autenticado", () => {
  assert.doesNotThrow(() => validarPropiedadReserva("cliente-1", "cliente-1"));
});

test("rechaza modificar la reserva de otro cliente", () => {
  assert.throws(() => validarPropiedadReserva("cliente-1", "cliente-2"), {
    statusCode: 403,
  });
});

test("permite al prestador modificar una cita de su perfil", () => {
  assert.doesNotThrow(() =>
    validarPropiedadProfesionalReserva("perfil-1", "perfil-1")
  );
});

test("rechaza al prestador modificar una cita de otro perfil", () => {
  assert.throws(
    () => validarPropiedadProfesionalReserva("perfil-1", "perfil-2"),
    { statusCode: 403 }
  );
});

test("devuelve conflicto cuando el horario ya está ocupado", () => {
  assert.throws(() => validarHorarioDisponible(true), { statusCode: 409 });
  assert.doesNotThrow(() => validarHorarioDisponible(false));
});