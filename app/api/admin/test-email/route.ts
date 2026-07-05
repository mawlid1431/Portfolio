import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  getEmailTemplatePreview,
  type EmailTemplateId,
} from "@/lib/email-preview-data";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export const runtime = "nodejs";
export const maxDuration = 30;

const TEMPLATE_IDS: EmailTemplateId[] = [
  "password-reset",
  "contact-admin",
  "contact-user",
];

export async function POST(request: Request) {
  try {
    const tokenHash = await getSessionTokenHash();
    if (!tokenHash) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = getConvexClient();
    const admin = await client.query(api.auth.me, { tokenHash });
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as { template?: string };
    const templateId = body.template as EmailTemplateId;

    if (!templateId || !TEMPLATE_IDS.includes(templateId)) {
      return NextResponse.json(
        { error: "Invalid template. Use password-reset, contact-admin, or contact-user." },
        { status: 400 },
      );
    }

    const preview = getEmailTemplatePreview(templateId);
    const to = admin.email;

    await sendEmail({
      to,
      subject: `[TEST] ${preview.subject}`,
      text: preview.text,
      html: preview.html,
      replyTo:
        templateId === "contact-admin"
          ? "alex@example.com"
          : undefined,
    });

    return NextResponse.json({ ok: true, to, template: templateId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send test email";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
