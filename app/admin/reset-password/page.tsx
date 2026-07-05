"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GlassButton from "@/components/GlassButton";
import PasswordInput from "@/components/PasswordInput";
import { useSubmitLock } from "@/lib/useSubmitLock";

const codeClass =
  "w-full rounded-xl border border-cream/15 bg-ink px-5 py-4 text-center text-2xl font-mono tracking-[0.45em] text-cream outline-none transition-colors focus:border-emerald-bright";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { loading, run } = useSubmitLock();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const code = String(data.get("code") ?? "").trim();
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    await run(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword, confirmPassword }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to reset password");
      }

      setDone(true);
      setTimeout(() => router.push("/admin"), 2000);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    });
  };

  if (done) {
    return (
      <div className="text-center">
        <p className="font-display text-4xl text-emerald-bright">✓</p>
        <p className="mt-4 text-sm text-cream-dim">
          Password updated. Redirecting to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
        >
          Admin email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initialEmail}
          autoComplete="email"
          className="w-full rounded-xl border border-cream/15 bg-ink px-5 py-4 text-sm text-cream outline-none transition-colors focus:border-emerald-bright"
        />
      </div>

      <div>
        <label
          htmlFor="code"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
        >
          6-digit reset code
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="••••••"
          autoComplete="one-time-code"
          className={codeClass}
        />
      </div>

      <PasswordInput
        id="newPassword"
        name="newPassword"
        label="New password"
        autoComplete="new-password"
      />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
      />

      <p className="text-[11px] text-cream-dim">
        Passwords are checked against known data breaches. Use at least 8
        characters.
      </p>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <GlassButton type="submit" variant="accent" size="md" className="mt-2" disabled={loading}>
        {loading ? "Saving…" : "Set new password"}
      </GlassButton>

      <Link
        href="/admin"
        className="text-center text-xs text-cream-dim underline transition-colors hover:text-emerald-bright"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-glow/25 bg-ink-soft/80 p-10 backdrop-blur">
        <p className="font-display text-3xl">
          MALITOS<span className="text-emerald-bright">.</span>
        </p>
        <h1 className="mt-2 text-xs uppercase tracking-[0.3em] text-cream-dim">
          Set new password
        </h1>
        <Suspense fallback={<p className="mt-10 text-sm text-cream-dim">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
