import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { ROLES } from "../data/roles";
import { AuthRequest, authenticateToken } from "../middlewares/auth.middleware";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { AuthService } from "./auth.service";

test("reconoce el rol de dueño de empresa", () => {
  assert.equal(AuthService.normalizarRol("dueno"), ROLES.DUENO);
  assert.equal(AuthService.normalizarRol("OWNER"), ROLES.DUENO);
});

test("el registro público no puede crear administradores globales", () => {
  assert.equal(AuthService.normalizarRol("ADMIN"), ROLES.CLI);
});

test("usa el rol actual de la base aunque el token tenga uno anterior", async () => {
  const previousSecret = process.env.JWT_SECRET;
  const secret = "test-jwt-secret";
  process.env.JWT_SECRET = secret;
  const previousBuscarPorId = UsuarioRepository.buscarPorId;
  UsuarioRepository.buscarPorId = (async () => ({
    _id: { toString: () => "owner-id" },
    username: "owner",
    rol: ROLES.DUENO,
    activo: true,
  })) as unknown as typeof UsuarioRepository.buscarPorId;

  try {
    const token = jwt.sign({ id: "owner-id", username: "owner", rol: ROLES.CLI }, secret);
    const request = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    let statusCode = 200;
    let responseBody: unknown;
    const response = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        responseBody = body;
        return this;
      },
    } as unknown as Response;
    let continued = false;

    await authenticateToken(request, response, () => {
      continued = true;
    });

    assert.equal(continued, true);
    assert.equal(statusCode, 200);
    assert.deepEqual(request.user, {
      id: "owner-id",
      username: "owner",
      rol: ROLES.DUENO,
    });
    assert.equal(responseBody, undefined);
  } finally {
    UsuarioRepository.buscarPorId = previousBuscarPorId;
    if (previousSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousSecret;
  }
});
