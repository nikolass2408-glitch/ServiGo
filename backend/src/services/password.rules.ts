export function validarPassword(password: unknown): asserts password is string {
  if (typeof password !== "string" || password.length < 8) {
    throw Object.assign(new Error("La contraseña debe tener mínimo 8 caracteres."), { statusCode: 400 });
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw Object.assign(new Error("La contraseña debe incluir mayúscula, minúscula y número."), { statusCode: 400 });
  }
}
