import { NextResponse } from "next/server";
import { rateLimitKey, resetTokenHash } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and reset code are required." },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Reset code must be 6 digits." },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const valid = await client.mutation(api.auth.verifyPasswordResetCode, {
      tokenHash: resetTokenHash(email, code),
      email,
      rateLimitKey: rateLimitKey("reset-verify", email),
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired reset code." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Verify-reset-code error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify reset code.";
    if (message.includes("Too many")) {
      return NextResponse.json(
        { error: message },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }
    return NextResponse.json(
      { error: "Failed to verify reset code." },
      { status: 400 },
    );
  }
}
