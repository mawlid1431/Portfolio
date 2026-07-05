import { NextResponse } from "next/server";
import { resetTokenHash } from "@/lib/auth";
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
    const valid = await client.query(api.auth.verifyPasswordResetCode, {
      tokenHash: resetTokenHash(email, code),
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired reset code." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify reset code." },
      { status: 400 },
    );
  }
}
