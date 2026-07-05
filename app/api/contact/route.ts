import { NextResponse } from "next/server";
import { getClientIp, rateLimitKey } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import { sendEmail } from "@/lib/email";
import { contactAdminEmail, contactUserEmail } from "@/lib/email-templates";
import { createIdempotencyKey } from "@/lib/idempotency";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      budget?: string;
      message?: string;
      idempotencyKey?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const budget = body.budget?.trim() ?? "Not specified";
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    const ip = getClientIp(request);
    const client = getConvexClient();

    await client.mutation(api.messages.create, {
      name,
      email,
      budget,
      message,
      rateLimitKey: rateLimitKey("contact", ip),
      idempotencyKey: body.idempotencyKey ?? createIdempotencyKey("contact"),
    });

    const to = process.env.CONTACT_TO ?? process.env.SMTP_USER;
    if (!to) {
      return NextResponse.json(
        { error: "Contact email is not configured." },
        { status: 500 },
      );
    }

    const adminTemplate = contactAdminEmail({ name, email, budget, message });
    const userTemplate = contactUserEmail({ name });

    await Promise.all([
      sendEmail({
        to,
        replyTo: email,
        subject: adminTemplate.subject,
        text: adminTemplate.text,
        html: adminTemplate.html,
      }),
      sendEmail({
        to: email,
        subject: userTemplate.subject,
        text: userTemplate.text,
        html: userTemplate.html,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
