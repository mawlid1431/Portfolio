"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassButton from "@/components/GlassButton";
import PasswordInput from "@/components/PasswordInput";
import { maskEmail } from "@/lib/mask-email";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotSent, setForgotSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body?.admin) router.replace("/admin/dashboard");
      });
  }, [router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Invalid credentials");
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Contact the site owner if you need access.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    setForgotEmail(email);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = (await res.json()) as {
        error?: string;
        maskedEmail?: string;
      };

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to send reset code");
      }

      setMaskedEmail(body.maskedEmail ?? maskEmail(email));
      setForgotSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send reset code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="orb absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-glow/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-emerald-glow/25 bg-ink-soft/80 p-6 backdrop-blur sm:p-10">
        <p className="font-display text-3xl">
          MALITOS<span className="text-emerald-bright">.</span>
        </p>
        <h1 className="mt-2 text-xs uppercase tracking-[0.3em] text-cream-dim">
          {mode === "login" ? "Admin panel" : "Reset password"}
        </h1>

        {mode === "login" ? (
          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-5">
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
                autoComplete="username"
                placeholder="admin@malitos.dev"
                className="w-full rounded-xl border border-cream/15 bg-ink px-5 py-4 text-base text-cream placeholder:text-cream-dim/50 outline-none transition-colors focus:border-emerald-bright md:text-sm"
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="current-password"
            />

            {error && (
              <p className="text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            <GlassButton type="submit" variant="accent" size="md" className="mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </GlassButton>

            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError("");
              }}
              className="text-center text-xs text-cream-dim underline transition-colors hover:text-emerald-bright"
            >
              Forgot password?
            </button>
          </form>
        ) : forgotSent ? (
          <div className="mt-10 text-center">
            <p className="font-display text-4xl tracking-[0.35em] text-emerald-bright">
              ••••••
            </p>
            <p className="mt-6 text-sm text-cream-dim">
              We sent a 6-digit reset code to{" "}
              <span className="text-cream">{maskedEmail}</span>
            </p>
            <p className="mt-3 text-xs text-cream-dim">
              Check your inbox and enter the code on the reset page. The code
              expires in 1 hour.
            </p>
            <GlassButton
              href={`/admin/reset-password?email=${encodeURIComponent(forgotEmail)}`}
              variant="accent"
              size="md"
              className="mt-8"
            >
              Enter reset code
            </GlassButton>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setForgotSent(false);
                setError("");
              }}
              className="mt-4 block w-full text-xs uppercase tracking-[0.2em] text-emerald-bright underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={onForgotSubmit} className="mt-10 flex flex-col gap-5">
            <p className="text-sm text-cream-dim">
              Enter your admin email and we&apos;ll send a 6-digit reset code.
            </p>
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim"
              >
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@malitos.dev"
                className="w-full rounded-xl border border-cream/15 bg-ink px-5 py-4 text-base text-cream placeholder:text-cream-dim/50 outline-none transition-colors focus:border-emerald-bright md:text-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400" role="alert">
                {error}
              </p>
            )}

            <GlassButton type="submit" variant="accent" size="md" className="mt-2" disabled={loading}>
              {loading ? "Sending…" : "Send reset code"}
            </GlassButton>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="text-center text-xs text-cream-dim underline transition-colors hover:text-emerald-bright"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
