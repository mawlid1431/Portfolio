import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyApiCorsHeaders,
  apiCorsPreflightResponse,
  getAllowedOrigins,
} from "@/lib/api-cors";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const isProd = process.env.NODE_ENV === "production";

/**
 * Build a Content-Security-Policy. In production it is strict and nonce-based
 * (`strict-dynamic`); in development it relaxes to `unsafe-inline`/`unsafe-eval`
 * so Turbopack HMR keeps working. Static headers (HSTS, X-Frame-Options, …) are
 * set globally in next.config.ts.
 */
function buildCsp(nonce: string): string {
  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `'self' 'unsafe-inline' 'unsafe-eval'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // framer-motion / inline style attributes need unsafe-inline for styles.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://res.cloudinary.com`,
    `media-src 'self' blob: https://res.cloudinary.com`,
    `font-src 'self'`,
    // Convex realtime (https + wss), HIBP breach check, Cloudinary uploads.
    `connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://api.pwnedpasswords.com https://api.cloudinary.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    ...(isProd ? [`upgrade-insecure-requests`] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Per-request nonce for the CSP. Web Crypto is available in the edge runtime.
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );
  const csp = buildCsp(nonce);

  // API routes: CORS handling (static security headers come from next.config).
  if (pathname.startsWith("/api")) {
    const allowedOrigins = getAllowedOrigins();
    if (request.method === "OPTIONS") {
      return apiCorsPreflightResponse(request, allowedOrigins);
    }
    return applyApiCorsHeaders(NextResponse.next(), request, allowedOrigins);
  }

  // Admin dashboard: require a session cookie before rendering.
  if (pathname.startsWith("/unknown/dashboard")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const login = new URL("/unknown", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  // HTML routes: propagate the nonce to Next (via request header, so it nonces
  // its own injected scripts) and emit the CSP on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on everything except static assets and image optimizer output.
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm)$).*)",
    },
  ],
};
