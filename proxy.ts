import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyApiCorsHeaders,
  apiCorsPreflightResponse,
  getAllowedOrigins,
} from "@/lib/api-cors";

const SESSION_COOKIE = "malitos_session";

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const allowedOrigins = getAllowedOrigins();

    if (request.method === "OPTIONS") {
      return apiCorsPreflightResponse(request, allowedOrigins);
    }

    const response = applyApiCorsHeaders(
      NextResponse.next(),
      request,
      allowedOrigins,
    );
    return applySecurityHeaders(response);
  }

  if (pathname.startsWith("/unknown/dashboard")) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const login = new URL("/unknown", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/unknown/dashboard/:path*", "/api/:path*"],
};
