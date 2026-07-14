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
    const result = await client.mutation(api.auth.requestPasswordReset, {
      email,
      tokenHash,
      rateLimitKey: rateLimitKey("forgot", `${ip}:${email}`),
    });

    // Send the code only when the account exists, but always return the same
    // generic 200 response so the endpoint can't reveal which emails are admins.
    if (result?.email) {
      const template = passwordResetCodeEmail({ code });
      await sendEmail({
        to: result.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    }

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmail(result?.email ?? email),
    });
  } catch (error) {
    console.error("Forgot-password error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send reset email";
    if (message.includes("Too many")) {
      return NextResponse.json(
        { error: message },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }
    return NextResponse.json(
      { error: "Failed to send reset email." },
      { status: 400 },
    );
  }
}
