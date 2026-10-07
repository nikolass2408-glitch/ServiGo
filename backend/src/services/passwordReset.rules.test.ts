import assert from "node:assert/strict";
import test from "node:test";
import {
  crearPasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from "./passwordReset.rules";

test("genera un token opaco y guarda solo un hash distinto", () => {
  const ahora = new Date("2026-10-05T12:00:00.000Z");
  const { token, tokenHash } = crearPasswordResetToken(ahora);

  assert.match(token, /^[a-f0-9]{64}$/);
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(tokenHash, token);
  assert.equal(hashPasswordResetToken(token), tokenHash);
});

test("el enlace vence a los treinta minutos", () => {
  const ahora = new Date("2026-10-05T12:00:00.000Z");
  const { expiresAt } = crearPasswordResetToken(ahora);

  assert.equal(expiresAt.getTime() - ahora.getTime(), PASSWORD_RESET_TTL_MS);
});