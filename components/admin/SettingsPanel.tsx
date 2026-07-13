"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
  formatDate,
} from "@/lib/admin-hooks";

type SessionRow = {
  _id: string;
  deviceLabel: string;
  userAgent: string;
  createdAt: number;
  lastActiveAt: number;
  isCurrent: boolean;
};

export default function SettingsPanel() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/auth/sessions", { credentials: "same-origin" });
      if (!res.ok) {
        setSessions([]);
        return;
      }
      const body = (await res.json()) as { sessions?: SessionRow[] };
      setSessions(body.sessions ?? []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    const task = queueMicrotask.bind(null, () => {
      void loadSessions();
    });
    task();
  }, [loadSessions]);

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to change password");
      }

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    const res = await fetch("/api/auth/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessionId }),
    });

    const body = (await res.json()) as { loggedOut?: boolean; error?: string };
    if (!res.ok && !body.loggedOut) {
      return;
    }

    if (body.loggedOut) {
      router.push("/admin");
      return;
    }

    void loadSessions();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className={`${cardClass} flex flex-col gap-4`}>
        <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
          Email templates
        </h2>
        <p className="text-sm text-cream-dim">
          Preview transactional emails and send a test to your inbox.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard/email-preview" className={btnPrimary}>
            Open email preview
          </Link>
          {process.env.NODE_ENV === "development" && (
            <Link href="/dev/email-preview" className={btnGhost}>
              Dev preview (no login)
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={onChangePassword} className={`${cardClass} flex flex-col gap-4`}>
        <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
          Change password
        </h2>
        <p className="text-sm text-cream-dim">
          New passwords are checked against known data breaches (Have I Been Pwned).
        </p>

        <PasswordInput
          id="current-password"
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordInput
          id="new-password"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {passwordError && (
          <p className="text-xs text-red-400" role="alert">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="text-xs text-emerald-bright" role="status">
            {passwordSuccess}
          </p>
        )}

        <button type="submit" className={`${btnPrimary} w-fit`} disabled={passwordLoading}>
          {passwordLoading ? "Updating…" : "Update password"}
        </button>
      </form>

      <div className={cardClass}>
        <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
          Active sessions
        </h2>
        <p className="mt-2 text-sm text-cream-dim">
          Devices signed in to your admin account. Revoke any session you don&apos;t
          recognize.
        </p>

        {loadingSessions ? (
          <p className="mt-6 text-sm text-cream-dim">Loading sessions…</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {sessions.map((s) => (
              <li
                key={s._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cream/10 bg-ink/40 p-4"
              >
                <div>
                  <p className="font-medium">
                    {s.deviceLabel}
                    {s.isCurrent && (
                      <span className="ml-2 text-xs text-emerald-bright">
                        (this device)
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-cream-dim">
                    Last active {formatDate(s.lastActiveAt)}
                  </p>
                </div>
                {!s.isCurrent && (
                  <button
                    type="button"
                    className={btnDanger}
                    onClick={() => void revokeSession(s._id)}
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
            {sessions.length === 0 && (
              <li className="text-sm text-cream-dim">No active sessions.</li>
            )}
          </ul>
        )}

        <button
          type="button"
          className={`${btnGhost} mt-4`}
          onClick={() => void loadSessions()}
        >
          Refresh sessions
        </button>
      </div>
    </div>
  );
}
