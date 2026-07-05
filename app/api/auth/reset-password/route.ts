import { NextResponse } from "next/server";
import { resetTokenHash } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import { validatePasswordStrength } from "@/lib/password";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      code?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();
    const newPassword = body.newPassword;
    const confirmPassword = body.confirmPassword;

    if (!email || !code || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Reset code must be 6 digits." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    const client = getConvexClient();
    await client.action(api.authActions.resetPassword, {
      tokenHash: resetTokenHash(email, code),
      newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reset password";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
