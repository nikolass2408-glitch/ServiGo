import assert from "node:assert/strict";
import test from "node:test";
import { ROLES } from "../data/roles";
import { AuthService } from "./auth.service";

test("reconoce el rol de dueño de empresa", () => {
  assert.equal(AuthService.normalizarRol("dueno"), ROLES.DUENO);
  assert.equal(AuthService.normalizarRol("OWNER"), ROLES.DUENO);
});

test("el registro público no puede crear administradores globales", () => {
  assert.equal(AuthService.normalizarRol("ADMIN"), ROLES.CLI);
});
