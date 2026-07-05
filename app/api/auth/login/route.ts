import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  generateToken,
  getClientIp,
  hashValue,
  rateLimitKey,
} from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const rawToken = generateToken();
    const tokenHash = hashValue(rawToken);
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const client = getConvexClient();
    const admin = await client.action(api.authActions.login, {
      email,
      password,
      tokenHash,
      userAgent,
      ipHash: hashValue(ip),
      rateLimitKey: rateLimitKey("login", ip),
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ ok: true, admin });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
