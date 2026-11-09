import assert from "node:assert/strict";
import test from "node:test";

import {
  empresaPermiteReserva,
  HORARIO_EMPRESA_EJEMPLO,
  validarHorarioEmpresa,
} from "./empresa.horario";

test("el horario de ejemplo trabaja jornada completa entre semana y media jornada el fin de semana", () => {
  assert.equal(
    empresaPermiteReserva(HORARIO_EMPRESA_EJEMPLO, "2026-10-30", "21:30", 30),
    true
  );
  assert.equal(
    empresaPermiteReserva(HORARIO_EMPRESA_EJEMPLO, "2026-10-30", "21:30", 31),
    false
  );
  assert.equal(
    empresaPermiteReserva(HORARIO_EMPRESA_EJEMPLO, "2026-10-31", "12:30", 30),
    true
  );
  assert.equal(
    empresaPermiteReserva(HORARIO_EMPRESA_EJEMPLO, "2026-10-31", "12:30", 31),
    false
  );
});

test("el horario de empresa rechaza los días cerrados", () => {
  const horario = {
    ...HORARIO_EMPRESA_EJEMPLO,
    dias: HORARIO_EMPRESA_EJEMPLO.dias.map((dia) =>
      dia.dia === 0 ? { ...dia, abierto: false } : dia
    ),
  };

  assert.equal(empresaPermiteReserva(horario, "2026-11-01", "09:00", 30), false);
});

test("el modo 24 horas no restringe por horario de empresa", () => {
  const horario = { ...HORARIO_EMPRESA_EJEMPLO, abierto24Horas: true };
  assert.equal(empresaPermiteReserva(horario, "2026-11-01", "23:30", 60), true);
});

test("valida que exista un horario único para cada día", () => {
  assert.throws(
    () => validarHorarioEmpresa({
      ...HORARIO_EMPRESA_EJEMPLO,
      dias: HORARIO_EMPRESA_EJEMPLO.dias.slice(1),
    }),
    /siete días/
  );
  assert.throws(
    () => validarHorarioEmpresa({
      ...HORARIO_EMPRESA_EJEMPLO,
      dias: HORARIO_EMPRESA_EJEMPLO.dias.map((dia) =>
        dia.dia === 1 ? { ...dia, horaFin: "07:00" } : dia
      ),
    }),
    /horario inválido/
  );
});
