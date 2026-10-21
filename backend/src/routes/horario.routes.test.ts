import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import test from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { createServer, Server } from "node:http";

import { ROLES, Role } from "../data/roles";
import { HorarioRepository } from "../repositories/horario.repository";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { HorarioService } from "../services/horario.service";
import horarioRoutes from "./horario.routes";

const testSecret = "horario-routes-test-secret";
const jwtSecretOriginal = process.env.JWT_SECRET;
const metodosOriginales = {
  buscarPorId: UsuarioRepository.buscarPorId,
  listarTodos: HorarioRepository.listarTodos,
  crear: HorarioService.crear,
  modificar: HorarioService.modificar,
};

async function iniciarServidor(): Promise<{ server: Server; baseUrl: string }> {
  const app = express();
  app.use(express.json());
  app.use(horarioRoutes);
  const server = createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

function tokenPara(rol: Role): string {
  const id = `usuario-${rol.toLowerCase()}`;
  return jwt.sign({ id, username: "test", rol }, testSecret);
}

async function cerrarServidor(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test.before(() => {
  process.env.JWT_SECRET = testSecret;
  UsuarioRepository.buscarPorId = (async (id: string) => ({
    _id: { toString: () => id },
    username: "test",
    rol: id === "usuario-pro" ? ROLES.PRO : id === "usuario-admin" ? ROLES.ADMIN : ROLES.CLI,
    activo: true,
  })) as unknown as typeof UsuarioRepository.buscarPorId;
});

test.afterEach(() => {
  HorarioRepository.listarTodos = metodosOriginales.listarTodos;
  HorarioService.crear = metodosOriginales.crear;
  HorarioService.modificar = metodosOriginales.modificar;
});

test.after(() => {
  UsuarioRepository.buscarPorId = metodosOriginales.buscarPorId;
  HorarioRepository.listarTodos = metodosOriginales.listarTodos;
  HorarioService.crear = metodosOriginales.crear;
  HorarioService.modificar = metodosOriginales.modificar;
  if (jwtSecretOriginal === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = jwtSecretOriginal;
});

test("rechaza listar horarios sin token", async () => {
  const { server, baseUrl } = await iniciarServidor();

  try {
    const response = await fetch(`${baseUrl}/horarios/`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Token de acceso requerido." });
  } finally {
    await cerrarServidor(server);
  }
});

test("permite listar horarios a usuarios autenticados", async () => {
  const horarios = [{ id: "horario-1", dia: 1 }];
  HorarioRepository.listarTodos = (async () =>
    horarios) as unknown as typeof HorarioRepository.listarTodos;
  const { server, baseUrl } = await iniciarServidor();

  try {
    const response = await fetch(`${baseUrl}/horarios/`, {
      headers: { Authorization: `Bearer ${tokenPara(ROLES.PRO)}` },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), horarios);
  } finally {
    await cerrarServidor(server);
  }
});

test("permite crear horarios a profesionales y deniega a clientes", async () => {
  const datos = {
    profesional: "profesional-1",
    dia: 1,
    horaInicio: "09:00",
    horaFin: "17:00",
  };
  const horarioCreado = { id: "horario-1", ...datos };
  let llamadasAlServicio = 0;
  HorarioService.crear = async () => {
    llamadasAlServicio += 1;
    return horarioCreado as never;
  };
  const { server, baseUrl } = await iniciarServidor();

  try {
    const denegada = await fetch(`${baseUrl}/horarios/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPara(ROLES.CLI)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
    assert.equal(denegada.status, 403);
    assert.equal(llamadasAlServicio, 0);

    const permitida = await fetch(`${baseUrl}/horarios/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPara(ROLES.PRO)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });
    assert.equal(permitida.status, 201);
    assert.deepEqual(await permitida.json(), horarioCreado);
    assert.equal(llamadasAlServicio, 1);
  } finally {
    await cerrarServidor(server);
  }
});

test("solo permite modificar horarios a administradores", async () => {
  const resultado = { id: "horario-1", activo: false };
  let llamada: unknown[] = [];
  HorarioService.modificar = async (...args: Parameters<typeof HorarioService.modificar>) => {
    llamada = args;
    return resultado as never;
  };
  const { server, baseUrl } = await iniciarServidor();

  try {
    const denegada = await fetch(`${baseUrl}/horarios/horario-1/modificar/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenPara(ROLES.PRO)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activo: false }),
    });
    assert.equal(denegada.status, 403);
    assert.deepEqual(llamada, []);

    const permitida = await fetch(`${baseUrl}/horarios/horario-1/modificar/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenPara(ROLES.ADMIN)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activo: false }),
    });
    assert.equal(permitida.status, 200);
    assert.deepEqual(await permitida.json(), resultado);
    assert.deepEqual(llamada, [
      "horario-1",
      { activo: false },
      { id: "usuario-admin", username: "test", rol: ROLES.ADMIN },
    ]);
  } finally {
    await cerrarServidor(server);
  }
});