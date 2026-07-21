import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "parabox_admin_session";

export const isAdminAuthConfigured = Boolean(process.env.ADMIN_PASSWORD);

// Token de sesión = hash de la contraseña. Nunca guardamos la contraseña en
// texto plano en la cookie, y nunca hay un valor de fallback: sin
// ADMIN_PASSWORD configurada, el panel admin queda cerrado por completo
// (fail closed), no expuesto con una clave demo conocida.
export function computeAdminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256").update(password).digest("hex");
}

export function isValidAdminPassword(candidate: string | undefined | null): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !candidate) return false;
  return constantTimeEqual(candidate, password);
}

export function isValidAdminToken(candidate: string | undefined | null): boolean {
  const expected = computeAdminToken();
  if (!expected || !candidate) return false;
  return constantTimeEqual(candidate, expected);
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
