import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function crearPasswordResetToken(ahora = new Date()) {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(ahora.getTime() + PASSWORD_RESET_TTL_MS),
  };
}