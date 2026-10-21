
import assert from "node:assert/strict";
import test from "node:test";
import { Types } from "mongoose";

import { ReservaController } from "./reserva.controller";
import { ReservaService } from "../services/reserva.service";

type MockResponse = {
  statusCode?: number;
  body?: unknown;
  status: (code: number) => MockResponse;
  json: (value: unknown) => MockResponse;
};

// Guardamos los métodos originales para restaurarlos
const serviceOriginal = {
  crear: ReservaService.crear,
  reprogramar: ReservaService.reprogramar,
  disponibilidad: ReservaService.disponibilidad,
};

// Simulamos la respuesta de Express
function crearRespuesta(): MockResponse {
  const respuesta: MockResponse = {
    statusCode: undefined,
    body: undefined,

    status(code: number) {
      this.statusCode = code;
      return this;
    },

    json(value: unknown) {
      this.body = value;
      return this;
    },
  };

  return respuesta;
}

// Restauramos los métodos después de cada prueba
test.afterEach(() => {
  ReservaService.crear = serviceOriginal.crear;
  ReservaService.reprogramar = serviceOriginal.reprogramar;
  ReservaService.disponibilidad = serviceOriginal.disponibilidad;
});

test("crear responde 201 y envía los datos y usuario al servicio", async () => {
  const datos = {
    servicio: "servicio-1",
    fecha: "2026-11-01",
    hora: "10:00",
  };

  const usuario = { id: "cliente-1", rol: "CLI" as const };
  const reservaCreada = { id: "reserva-1", ...datos };

  let llamada: unknown[] = [];

  ReservaService.crear = async (
    ...args: Parameters<typeof ReservaService.crear>
  ) => {
    llamada = args;
    return reservaCreada;
  };

  const respuesta = crearRespuesta();

  await ReservaController.crear(
    { body: datos, user: usuario } as never,
    respuesta as never
  );

  assert.equal(respuesta.statusCode, 201);
  assert.deepEqual(respuesta.body, reservaCreada);
  assert.deepEqual(llamada, [datos, usuario]);
});

test("reprogramar envía ID, nueva fecha, hora y usuario al servicio", async () => {
  const usuario = { id: "cliente-1", rol: "CLI" as const };

  const resultado = {
    id: "reserva-1",
    fecha: "2026-11-02",
    hora: "11:30",
  };

  let llamada: unknown[] = [];

  ReservaService.reprogramar = async (
    ...args: Parameters<typeof ReservaService.reprogramar>
  ) => {
    llamada = args;
    return resultado;
  };

  const respuesta = crearRespuesta();

  await ReservaController.reprogramar(
    {
      params: { id: "reserva-1" },
      body: { fecha: "2026-11-02", hora: "11:30" },
      user: usuario,
    } as never,
    respuesta as never
  );

  assert.deepEqual(respuesta.body, resultado);

  assert.deepEqual(llamada, [
    "reserva-1",
    "2026-11-02",
    "11:30",
    usuario,
  ]);
});

test("disponibilidad convierte los parámetros de consulta a texto", async () => {
  const resultado = {
    profesional: new Types.ObjectId(),
    fecha: "2026-11-01",
    servicios: [
      {
        servicio: {
          id: new Types.ObjectId(),
          nombre: "Corte",
          duracion: 30,
          precio: 100,
        },
        horariosDisponibles: ["09:00"],
      },
    ],
  };

  let llamada: unknown[] = [];

  ReservaService.disponibilidad = async (
    ...args: Parameters<typeof ReservaService.disponibilidad>
  ) => {
    llamada = args;
    return resultado;
  };

  const respuesta = crearRespuesta();

  await ReservaController.disponibilidad(
    {
      query: {
        profesional: "pro-1",
        fecha: "2026-11-01",
        servicio: 42,
      },
    } as never,
    respuesta as never
  );

  assert.deepEqual(respuesta.body, resultado);

  assert.deepEqual(llamada, [
    "pro-1",
    "2026-11-01",
    "42",
  ]);
});
