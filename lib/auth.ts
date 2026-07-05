import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE = "malitos_session";
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

/** Cryptographically secure 6-digit reset code */
export function generateResetCode(): string {
  const n = randomBytes(3).readUIntBE(0, 3) % 1_000_000;
  return n.toString().padStart(6, "0");
}

export function resetTokenHash(email: string, code: string): string {
  return hashValue(`${email.toLowerCase().trim()}:${code.trim()}`);
}
