import { createHash, randomBytes } from "crypto";

export { SESSION_COOKIE } from "./session-cookie";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function getClientIp(request: Request): string {
  // Trust only platform-set headers. On Vercel `x-vercel-forwarded-for` is the
  // verified client IP; otherwise use the RIGHT-most `x-forwarded-for` hop (the
  // one appended by our own trusted proxy), never the client-controlled
  // left-most value, which is spoofable and would let attackers rotate the
  // rate-limit bucket per request.
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]?.trim() || "unknown";

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1] ?? "unknown";
  }
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
