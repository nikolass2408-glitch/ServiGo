import assert from "node:assert/strict";
import test from "node:test";
import { detectarTipoImagen, tipoPermitido } from "./imageUpload.rules";

test("reconoce PNG, JPEG y WebP por su firma binaria", () => {
  assert.equal(
    detectarTipoImagen(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    "png"
  );
  assert.equal(detectarTipoImagen(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "jpg");
  assert.equal(detectarTipoImagen(Buffer.from("RIFF0000WEBP")), "webp");
  assert.equal(detectarTipoImagen(Buffer.from("<svg></svg>")), null);
});

test("requiere concordancia entre MIME y firma real", () => {
  assert.equal(tipoPermitido("image/png", "png"), true);
  assert.equal(tipoPermitido("image/jpeg", "png"), false);
  assert.equal(tipoPermitido("image/svg+xml", "png"), false);
});
