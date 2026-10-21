import assert from "node:assert/strict";
import test from "node:test";

import { HorarioController } from "./horario.controller";
import { HorarioService } from "../services/horario.service";

type MockResponse = {
  statusCode?: number;
  body?: unknown;
  status: (code: number) => MockResponse;
  json: (value: unknown) => MockResponse;
};

const metodosOriginales = {
  listar: HorarioService.listar,
  obtenerPorId: HorarioService.obtenerPorId,
  crear: HorarioService.crear,
  modificar: HorarioService.modificar,
  eliminar: HorarioService.eliminar,
};

function crearRespuesta(): MockResponse {
  return {
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
}

test.afterEach(() => {
  HorarioService.listar = metodosOriginales.listar;
  HorarioService.obtenerPorId = metodosOriginales.obtenerPorId;
  HorarioService.crear = metodosOriginales.crear;
  HorarioService.modificar = metodosOriginales.modificar;
  HorarioService.eliminar = metodosOriginales.eliminar;
});

test("listar responde 200 con los horarios", async () => {
  const horarios = [{ id: "horario-1", dia: 1 }];
  HorarioService.listar = (async () =>
    horarios) as unknown as typeof HorarioService.listar;

  const res = crearRespuesta();
  await HorarioController.listar({} as never, res as never);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, horarios);
});

test("listar responde 500 si el servicio falla", async () => {
  HorarioService.listar = (async () => {
    throw new Error("Error de prueba");
  }) as unknown as typeof HorarioService.listar;

  const res = crearRespuesta();
  await HorarioController.listar({} as never, res as never);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    mensaje: "Error al obtener la lista de horarios",
  });
});

test("obtenerPorId responde 200 con el horario encontrado", async () => {
  const horario = { id: "horario-1", dia: 1 };
  let idRecibido = "";

  HorarioService.obtenerPorId = (async (id: string) => {
    idRecibido = id;
    return horario;
  }) as unknown as typeof HorarioService.obtenerPorId;

  const res = crearRespuesta();
  await HorarioController.obtenerPorId(
    { params: { id: "horario-1" } } as never,
    res as never
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, horario);
  assert.equal(idRecibido, "horario-1");
});

test("obtenerPorId responde 404 si no encuentra el horario", async () => {
  HorarioService.obtenerPorId = (async () =>
    null) as unknown as typeof HorarioService.obtenerPorId;

  const res = crearRespuesta();
  await HorarioController.obtenerPorId(
    { params: { id: "inexistente" } } as never,
    res as never
  );

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { mensaje: "Horario no encontrado" });
});

test("obtenerPorId responde 500 si el servicio falla", async () => {
  HorarioService.obtenerPorId = (async () => {
    throw new Error("Error de prueba");
  }) as unknown as typeof HorarioService.obtenerPorId;

  const res = crearRespuesta();
  await HorarioController.obtenerPorId(
    { params: { id: "horario-1" } } as never,
    res as never
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { mensaje: "Error al obtener el horario" });
});

test("crear responde 401 si no hay usuario autenticado", async () => {
  const res = crearRespuesta();
  await HorarioController.crear(
    { body: { dia: 1 } } as never,
    res as never
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { mensaje: "Usuario no autenticado" });
});

test("crear responde 201 y envía los datos y el usuario al servicio", async () => {
  const datos = { dia: 1, horaInicio: "09:00", horaFin: "17:00" };
  const usuario = { id: "usuario-1", rol: "PRO" as const };
  const creado = { id: "horario-1", ...datos };
  let llamada: unknown[] = [];

  HorarioService.crear = (async (...args: Parameters<typeof HorarioService.crear>) => {
    llamada = args;
    return creado;
  }) as unknown as typeof HorarioService.crear;

  const res = crearRespuesta();
  await HorarioController.crear(
    { body: datos, user: usuario } as never,
    res as never
  );

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, creado);
  assert.deepEqual(llamada, [datos, usuario]);
});

test("crear responde 500 si el servicio falla", async () => {
  HorarioService.crear = (async () => {
    throw new Error("Error de prueba");
  }) as unknown as typeof HorarioService.crear;

  const res = crearRespuesta();
  await HorarioController.crear(
    { body: {}, user: { id: "usuario-1", rol: "PRO" } } as never,
    res as never
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { mensaje: "Error al crear el horario" });
});

test("modificar responde 401 si no hay usuario autenticado", async () => {
  const res = crearRespuesta();
  await HorarioController.modificar(
    { params: { id: "horario-1" }, body: {} } as never,
    res as never
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { mensaje: "Usuario no autenticado" });
});

test("modificar responde 200 y envía ID, datos y usuario al servicio", async () => {
  const id = "horario-1";
  const datos = { horaInicio: "10:00" };
  const usuario = { id: "usuario-1", rol: "PRO" as const };
  const modificado = { id, ...datos };
  let llamada: unknown[] = [];

  HorarioService.modificar = (async (...args: Parameters<typeof HorarioService.modificar>) => {
    llamada = args;
    return modificado;
  }) as unknown as typeof HorarioService.modificar;

  const res = crearRespuesta();
  await HorarioController.modificar(
    { params: { id }, body: datos, user: usuario } as never,
    res as never
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, modificado);
  assert.deepEqual(llamada, [id, datos, usuario]);
});

test("modificar responde 500 si el servicio falla", async () => {
  HorarioService.modificar = (async () => {
    throw new Error("Error de prueba");
  }) as unknown as typeof HorarioService.modificar;

  const res = crearRespuesta();
  await HorarioController.modificar(
    {
      params: { id: "horario-1" },
      body: {},
      user: { id: "usuario-1", rol: "PRO" },
    } as never,
    res as never
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { mensaje: "Error al modificar el horario" });
});

test("eliminar responde 401 si no hay usuario autenticado", async () => {
  const res = crearRespuesta();
  await HorarioController.eliminar(
    { params: { id: "horario-1" } } as never,
    res as never
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { mensaje: "Usuario no autenticado" });
});

test("eliminar responde 200 y envía ID y usuario al servicio", async () => {
  const id = "horario-1";
  const usuario = { id: "usuario-1", rol: "PRO" as const };
  let llamada: unknown[] = [];

  HorarioService.eliminar = (async (...args: Parameters<typeof HorarioService.eliminar>) => {
    llamada = args;
  }) as unknown as typeof HorarioService.eliminar;

  const res = crearRespuesta();
  await HorarioController.eliminar(
    { params: { id }, user: usuario } as never,
    res as never
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    mensaje: "Horario eliminado correctamente",
  });
  assert.deepEqual(llamada, [id, usuario]);
});

test("eliminar responde 500 si el servicio falla", async () => {
  HorarioService.eliminar = (async () => {
    throw new Error("Error de prueba");
  }) as unknown as typeof HorarioService.eliminar;

  const res = crearRespuesta();
  await HorarioController.eliminar(
    {
      params: { id: "horario-1" },
      user: { id: "usuario-1", rol: "PRO" },
    } as never,
    res as never
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { mensaje: "Error al eliminar el horario" });
});