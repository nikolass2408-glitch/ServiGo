import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import test from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import { createServer, Server } from "node:http";
import { ROLES, Role } from "../data/roles";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { ReservaService } from "../services/reserva.service";
import reservaRoutes from "./reserva.routes";

const testSecret = "reserva-routes-test-secret";
const usuarioOriginal = UsuarioRepository.buscarPorId;
const completarOriginal = ReservaService.completar;

async function iniciarServidor(): Promise<{ server: Server; baseUrl: string }> {
  const app = express();
  app.use(express.json());
  app.use(reservaRoutes);
  const server = createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

function tokenPara(rol: Role): string {
  return jwt.sign({ id: "usuario-test", username: "test", rol }, testSecret);
}

async function cerrarServidor(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test.before(() => {
  process.env.JWT_SECRET = testSecret;
  UsuarioRepository.buscarPorId = async () => ({ activo: true } as never);
});

test.after(() => {
  UsuarioRepository.buscarPorId = usuarioOriginal;
  ReservaService.completar = completarOriginal;
});

test("las rutas de reserva rechazan solicitudes sin token", async () => {
  const { server, baseUrl } = await iniciarServidor();

  try {
    const response = await fetch(`${baseUrl}/reservas/lista/`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Token de acceso requerido." });
  } finally {
    await cerrarServidor(server);
  }
});

test("la ruta de completar deniega clientes y permite a profesionales autenticados", async () => {
  const { server, baseUrl } = await iniciarServidor();
  let llamadasAlServicio = 0;
  ReservaService.completar = async () => {
    llamadasAlServicio += 1;
    return { id: "reserva-1", estado: "COMPLETADA" } as never;
  };

  try {
    const denegada = await fetch(`${baseUrl}/reservas/reserva-1/completar/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenPara(ROLES.CLI)}` },
    });
    assert.equal(denegada.status, 403);
    assert.equal(llamadasAlServicio, 0);

    const permitida = await fetch(`${baseUrl}/reservas/reserva-1/completar/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenPara(ROLES.PRO)}` },
    });
    assert.equal(permitida.status, 200);
    assert.deepEqual(await permitida.json(), { id: "reserva-1", estado: "COMPLETADA" });
    assert.equal(llamadasAlServicio, 1);
  } finally {
    await cerrarServidor(server);
  }
});