import assert from "node:assert/strict";
import test from "node:test";
import { requiereRecordatorio } from "./recordatorio.rules";

test("activa el recordatorio hasta una hora antes de la cita", () => {
  const ahora = new Date("2026-10-06T08:00:00");
  assert.equal(requiereRecordatorio("2026-10-06", "09:00", ahora), true);
  assert.equal(
    requiereRecordatorio("2026-10-06", "09:00", new Date("2026-10-06T08:59:00")),
    true
  );
});

test("no envía recordatorios antes de la ventana ni durante o después de la cita", () => {
  assert.equal(
    requiereRecordatorio("2026-10-06", "09:00", new Date("2026-10-06T07:59:59")),
    false
  );
  assert.equal(
    requiereRecordatorio("2026-10-06", "09:00", new Date("2026-10-06T09:00:00")),
    false
  );
});

test("ignora fecha y hora con formato inválido", () => {
  assert.equal(
    requiereRecordatorio("2026-02-30", "09:00", new Date("2026-02-28T08:00:00")),
    false
  );
  assert.equal(
    requiereRecordatorio("2026-10-06", "25:00", new Date("2026-10-06T08:00:00")),
    false
  );
});
