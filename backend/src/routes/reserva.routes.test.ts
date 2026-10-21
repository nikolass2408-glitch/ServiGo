
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import test, { after, before } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { createServer, Server } from "node:http";

import { ROLES, Role } from "../data/roles";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ReservaService } from "../services/reserva.service";
import reservaRoutes from "./reserva.routes";


const testSecret = "reserva-routes-test-secret";
const jwtSecretOriginal = process.env.JWT_SECRET;
const usuarioOriginal = UsuarioRepository.buscarPorId;
const listarOriginal = ReservaService.listar;
const completarOriginal = ReservaService.completar;
const profesionalId = "507f1f77bcf86cd799439011";
const clienteId = "507f1f77bcf86cd799439012";

async function iniciarServidor(): Promise<{
  server: Server;
  baseUrl: string;
}> {
  const app = express();

  app.use(express.json());
  app.use(reservaRoutes);

  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

function tokenPara(rol: Role): string {
  const id = rol === ROLES.PRO ? profesionalId : clienteId;

  return jwt.sign(
    { id, username: "test", rol },
    testSecret
  );
}

async function cerrarServidor(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

before(() => {
  process.env.JWT_SECRET = testSecret;
  UsuarioRepository.buscarPorId = (async (id: string) => ({
      _id: { toString: () => id },
      username: "test",
      rol: id === profesionalId ? ROLES.PRO : ROLES.CLI,
      activo: true,
    })) as never;
  ReservaService.listar = async () => [];
});

after(() => {
  UsuarioRepository.buscarPorId = usuarioOriginal;
  ReservaService.listar = listarOriginal;
  ReservaService.completar = completarOriginal;
  if (jwtSecretOriginal === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = jwtSecretOriginal;
  }
});

test("las rutas de reserva rechazan solicitudes sin token", async () => {
  const { server, baseUrl } = await iniciarServidor();

  try {
    const response = await fetch(`${baseUrl}/reservas/lista/`);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: "Token de acceso requerido.",
    });
  } finally {
    await cerrarServidor(server);
  }
});

test("GET /reservas/lista/ permite consultar reservas autenticadas", async () => {
  const { server, baseUrl } = await iniciarServidor();

  try {
    const response = await fetch(`${baseUrl}/reservas/lista/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenPara(ROLES.CLI)}`,
      },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  } finally {
    await cerrarServidor(server);
  }
});

test("completar deniega clientes y permite profesionales autenticados", async () => {
  const { server, baseUrl } = await iniciarServidor();
  let llamadasAlServicio = 0;

  ReservaService.completar = async () => {
    llamadasAlServicio += 1;

    return {
      id: "reserva-1",
      estado: "COMPLETADA",
    } as never;
  };

  try {
    const denegada = await fetch(
      `${baseUrl}/reservas/reserva-1/completar/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenPara(ROLES.CLI)}`,
        },
      }
    );

    assert.equal(denegada.status, 403);
    assert.equal(llamadasAlServicio, 0);

    const permitida = await fetch(
      `${baseUrl}/reservas/reserva-1/completar/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokenPara(ROLES.PRO)}`,
        },
      }
    );

    assert.equal(permitida.status, 200);
    assert.deepEqual(await permitida.json(), {
      id: "reserva-1",
      estado: "COMPLETADA",
    });
    assert.equal(llamadasAlServicio, 1);
  } finally {
    await cerrarServidor(server);
  }
});
