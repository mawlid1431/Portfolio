/**
 * Session cookie name + lifetime. Kept in its own module with NO node:crypto
 * imports so it is safe to import from edge middleware (proxy.ts) as well as
 * Node routes.
 *
 * In production the `__Host-` prefix is used: the browser then enforces that
 * the cookie is Secure, has Path=/, and carries no Domain — which blocks
 * subdomain/insecure-origin cookie injection. The prefix REQUIRES Secure, so
 * it can't be used on http://localhost; dev falls back to the plain name.
 */
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-malitos_session"
    : "malitos_session";

/** Absolute session lifetime (also the cookie Max-Age), in seconds. */
export const SESSION_MAX_AGE = 14 * 24 * 60 * 60; // 14 days
