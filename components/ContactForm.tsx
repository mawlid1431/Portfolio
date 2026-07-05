"use client";

import { FormEvent, useState } from "react";
import GlassButton from "@/components/GlassButton";
import { SITE } from "@/lib/data";
import { createIdempotencyKey } from "@/lib/idempotency";
import { useSubmitLock } from "@/lib/useSubmitLock";

const inputClass =
  "w-full rounded-xl border border-cream/15 bg-ink-soft/70 px-5 py-4 text-base text-cream placeholder:text-cream-dim/60 outline-none transition-colors focus:border-emerald-bright md:text-sm";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { loading, run } = useSubmitLock();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      budget: String(data.get("budget") ?? ""),
      message: String(data.get("message") ?? ""),
      idempotencyKey: createIdempotencyKey("contact"),
    };

    await run(async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to send message");
      }

      setSent(true);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to send message");
    });
  };

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-glow/25 bg-ink-soft/70 p-12 text-center">
        <span className="font-display text-6xl text-emerald-bright">✓</span>
        <h2 className="font-display mt-6 text-3xl uppercase">Message sent</h2>
        <p className="mt-3 max-w-sm text-sm text-cream-dim">
          Thanks for reaching out — I&apos;ll get back to you at the email you
          provided. You can also write to me directly at{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-emerald-bright underline"
          >
            {SITE.email}
          </a>
        </p>
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          className="mt-8"
          onClick={() => setSent(false)}
        >
          Send another
        </GlassButton>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-cream/10 bg-ink-soft/40 p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
          >
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="John Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@company.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="budget"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
        >
          Budget
        </label>
        <select id="budget" name="budget" className={inputClass}>
          <option value="$100 – $500">$100 – $500 (Standard)</option>
          <option value="$600 – $1000">$600 – $1000 (Premium)</option>
          <option value="$1000+">$1000+ (Custom)</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
        >
          Tell me about your project
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="What are we building?"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <GlassButton
        type="submit"
        variant="accent"
        size="md"
        className="mt-2"
        disabled={loading}
      >
        {loading ? "Sending…" : "Send message"}
      </GlassButton>
    </form>
  );
}
