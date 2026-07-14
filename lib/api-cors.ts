import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCAL_ORIGIN = "http://localhost:3000";

/** Origins allowed to call /api/* cross-origin (e.g. www vs apex, Vercel previews). */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();
  // Only trust localhost outside production — otherwise malware on a victim's
  // machine listening on :3000 could make credentialed cross-origin calls.
  if (process.env.NODE_ENV !== "production") {
    origins.add(LOCAL_ORIGIN);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (siteUrl) {
    origins.add(siteUrl);
    try {
      const parsed = new URL(siteUrl);
      if (parsed.hostname.startsWith("www.")) {
        origins.add(
          `${parsed.protocol}//${parsed.hostname.slice(4)}${parsed.port ? `:${parsed.port}` : ""}`,
        );
      } else {
        origins.add(
          `${parsed.protocol}//www.${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}`,
        );
      }
    } catch {
      // ignore invalid NEXT_PUBLIC_SITE_URL
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  return [...origins];
}

function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.includes(origin);
}

export function applyApiCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  allowedOrigins: string[],
): NextResponse {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin!);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.append("Vary", "Origin");

  return response;
}

export function apiCorsPreflightResponse(
  request: NextRequest,
  allowedOrigins: string[],
): NextResponse {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, { status: 204 });
  return applyApiCorsHeaders(response, request, allowedOrigins);
}
