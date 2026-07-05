import { NextResponse } from "next/server";
import {
  generateResetCode,
  getClientIp,
  rateLimitKey,
  resetTokenHash,
} from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import { sendEmail } from "@/lib/email";
import { passwordResetCodeEmail } from "@/lib/email-templates";
import { maskEmail } from "@/lib/mask-email";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const code = generateResetCode();
    const tokenHash = resetTokenHash(email, code);
    const ip = getClientIp(request);

    const client = getConvexClient();
    const adminEmail = await client.mutation(api.auth.requestPasswordReset, {
      email,
      tokenHash,
      rateLimitKey: rateLimitKey("forgot", `${ip}:${email}`),
    });

    if (adminEmail) {
      const template = passwordResetCodeEmail({ code });
      await sendEmail({
        to: adminEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    }

    // Always succeed to prevent email enumeration
    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(email),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send reset email";
    // Generic message — don't leak rate-limit internals
    const safe =
      message.includes("Too many") ? message : "Failed to send reset email.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
