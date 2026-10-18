import assert from "node:assert/strict";
import test from "node:test";
import { validarPassword } from "./password.rules";

test("acepta la contraseña de invitación con mayúscula, minúscula y número", () => {
  assert.equal(validarPassword("ServiGo2026"), undefined);
});

test("rechaza contraseñas débiles al activar una invitación", () => {
  for (const password of ["corta", "solominusculas8", "SINNUMEROABC", null]) {
    assert.throws(
      () => validarPassword(password),
      (error: unknown) => Boolean(error && typeof error === "object" && "statusCode" in error && error.statusCode === 400)
    );
  }
});
