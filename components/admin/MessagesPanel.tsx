"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  btnDanger,
  btnGhost,
  cardClass,
  formatDate,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

export default function MessagesPanel() {
  const tokenHash = useAdminTokenHash();
  const messages = useQuery(
    api.messages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const markRead = useMutation(api.messages.markRead);
  const markUnread = useMutation(api.messages.markUnread);
  const remove = useMutation(api.messages.remove);

  if (!tokenHash || messages === undefined) {
    return <p className="text-sm text-cream-dim">Loading messages…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-cream-dim">
        Submissions from the Get in touch form on your site.
      </p>
      {messages.map((m) => (
        <div
          key={m._id}
          className={`${cardClass} transition-colors hover:border-emerald-glow/40 ${
            m.read
              ? "border-cream/10 bg-ink-soft/50"
              : "border-emerald-glow/30 bg-emerald-glow/5"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {m.name}
                {!m.read && (
                  <span className="ml-3 rounded-full bg-emerald-glow px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                    New
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-cream-dim">
                <a href={`mailto:${m.email}`} className="hover:text-emerald-bright">
                  {m.email}
                </a>
              </p>
            </div>
            <span className="text-xs text-cream-dim">{formatDate(m.createdAt)}</span>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-bright">
            Budget: {m.budget}
          </p>
          <p className="mt-3 text-sm text-cream-dim whitespace-pre-wrap">{m.message}</p>
          <div className="mt-4 flex gap-2">
            {!m.read ? (
              <button
                type="button"
                className={btnGhost}
                onClick={() =>
                  void markRead({ tokenHash, messageId: m._id })
                }
              >
                Mark read
              </button>
            ) : (
              <button
                type="button"
                className={btnGhost}
                onClick={() =>
                  void markUnread({ tokenHash, messageId: m._id })
                }
              >
                Mark unread
              </button>
            )}
            <button
              type="button"
              className={btnDanger}
              onClick={() => void remove({ tokenHash, messageId: m._id })}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <p className="text-sm text-cream-dim">No get in touch submissions yet.</p>
      )}
    </div>
  );
}
