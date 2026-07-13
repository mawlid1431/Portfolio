"use client";

import { useState } from "react";
import GlassButton from "@/components/GlassButton";
import {
  EMAIL_TEMPLATE_META,
  getEmailTemplatePreview,
  type EmailTemplateId,
} from "@/lib/email-preview-data";

type Props = {
  /** When true, show "Send test email" (admin dashboard). */
  canSendTest?: boolean;
  adminEmail?: string;
};

export default function EmailPreviewPanel({
  canSendTest = false,
  adminEmail,
}: Props) {
  const [activeId, setActiveId] = useState<EmailTemplateId>("password-reset");
  const [view, setView] = useState<"html" | "text">("html");
  const [sendStatus, setSendStatus] = useState("");
  const [sending, setSending] = useState(false);

  const preview = getEmailTemplatePreview(activeId);

  const sendTest = async () => {
    if (!canSendTest) return;
    setSending(true);
    setSendStatus("");

    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ template: activeId }),
      });

      const body = (await res.json()) as { error?: string; to?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to send test email");
      }

      setSendStatus(`Test email sent to ${body.to ?? adminEmail ?? "your inbox"}.`);
    } catch (err) {
      setSendStatus(
        err instanceof Error ? err.message : "Failed to send test email",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-cream-dim">
        Preview how each transactional email looks before it goes out. Sample
        data is used for contact templates; the reset code shown is fake.
      </p>

      <div className="flex flex-wrap gap-2">
        {EMAIL_TEMPLATE_META.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveId(t.id);
              setSendStatus("");
            }}
            className={`rounded-full border px-4 py-2 text-xs transition-colors ${
              activeId === t.id
                ? "border-emerald-bright/50 bg-emerald-glow/15 text-emerald-bright"
                : "border-cream/15 text-cream-dim hover:border-cream/30 hover:text-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-cream/10 bg-ink-soft/40 p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cream-dim">
          {preview.label}
        </p>
        <p className="mt-1 text-sm text-cream-dim">{preview.description}</p>
        <p className="mt-4 text-xs text-cream-dim">
          Subject:{" "}
          <span className="text-cream">{preview.subject}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("html")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              view === "html"
                ? "bg-cream/10 text-cream"
                : "text-cream-dim hover:text-cream"
            }`}
          >
            HTML preview
          </button>
          <button
            type="button"
            onClick={() => setView("text")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              view === "text"
                ? "bg-cream/10 text-cream"
                : "text-cream-dim hover:text-cream"
            }`}
          >
            Plain text
          </button>
        </div>

        {view === "html" ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-cream/20 bg-ink">
            <iframe
              title={`${preview.label} preview`}
              srcDoc={preview.html}
              className="h-[min(70vh,640px)] w-full border-0"
              sandbox=""
            />
          </div>
        ) : (
          <pre className="mt-4 max-h-[min(70vh,640px)] overflow-auto rounded-xl border border-cream/10 bg-ink p-4 text-xs leading-relaxed text-cream-dim whitespace-pre-wrap">
            {preview.text}
          </pre>
        )}

        {canSendTest && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GlassButton
              type="button"
              variant="accent"
              size="sm"
              disabled={sending}
              onClick={() => void sendTest()}
            >
              {sending ? "Sending…" : "Send test to my email"}
            </GlassButton>
            {adminEmail && (
              <span className="text-xs text-cream-dim">
                Delivers to {adminEmail}
              </span>
            )}
          </div>
        )}

        {sendStatus && (
          <p
            className={`mt-3 text-xs ${
              sendStatus.startsWith("Test email sent")
                ? "text-emerald-bright"
                : "text-red-400"
            }`}
            role="status"
          >
            {sendStatus}
          </p>
        )}
      </div>
    </div>
  );
}
