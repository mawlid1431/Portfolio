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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    if (
      name.length > 120 ||
      email.length > 254 ||
      budget.length > 60 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
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
    const raw = error instanceof Error ? error.message : "";
    if (/Too many/i.test(raw)) {
      return NextResponse.json(
        { error: raw },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    }
    // Surface only safe validation messages; hide internal errors.
    const safe = /valid email|required|too long|exceed/i.test(raw)
      ? raw
      : "Failed to send message. Please try again.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
