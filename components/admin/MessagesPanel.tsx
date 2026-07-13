"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AdminModal from "./AdminModal";
import AdminRowActions from "./AdminRowActions";
import {
  btnDanger,
  btnGhost,
  cardClass,
  formatDate,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

type MessageItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.messages.list>>
>[number];

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-cream">{value}</p>
    </div>
  );
}

export default function MessagesPanel() {
  const tokenHash = useAdminTokenHash();
  const messages = useQuery(
    api.messages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const markRead = useMutation(api.messages.markRead);
  const markUnread = useMutation(api.messages.markUnread);
  const remove = useMutation(api.messages.remove);

  const [viewItem, setViewItem] = useState<MessageItem | null>(null);

  if (!tokenHash || messages === undefined) {
    return <p className="text-sm text-cream-dim">Loading messages…</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-cream-dim">
        Submissions from the Get in touch form on your site.
      </p>

      <AdminModal
        open={viewItem !== null}
        onClose={() => setViewItem(null)}
        title="Message details"
        description={
          viewItem
            ? `Received ${formatDate(viewItem.createdAt)}`
            : undefined
        }
        size="lg"
        footer={
          viewItem ? (
            <>
              {!viewItem.read ? (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    void markRead({ tokenHash, messageId: viewItem._id });
                    setViewItem({ ...viewItem, read: true });
                  }}
                >
                  Mark read
                </button>
              ) : (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    void markUnread({ tokenHash, messageId: viewItem._id });
                    setViewItem({ ...viewItem, read: false });
                  }}
                >
                  Mark unread
                </button>
              )}
              <button
                type="button"
                className={btnDanger}
                onClick={() => {
                  void remove({ tokenHash, messageId: viewItem._id });
                  setViewItem(null);
                }}
              >
                Delete
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
            </>
          ) : undefined
        }
      >
        {viewItem && (
          <div className="flex flex-col gap-4">
            <ViewField label="Name" value={viewItem.name} />
            <ViewField label="Email" value={viewItem.email} />
            <ViewField label="Budget" value={viewItem.budget} />
            <ViewField label="Message" value={viewItem.message} />
            <ViewField
              label="Status"
              value={viewItem.read ? "Read" : "Unread"}
            />
          </div>
        )}
      </AdminModal>

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
              <p className="mt-1 text-xs text-cream-dim">{m.email}</p>
            </div>
            <span className="text-xs text-cream-dim">{formatDate(m.createdAt)}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-cream-dim">{m.message}</p>
          <div className="mt-4">
            <AdminRowActions
              onView={() => setViewItem(m)}
              onDelete={() => void remove({ tokenHash, messageId: m._id })}
            />
          </div>
        </div>
      ))}
      {messages.length === 0 && (
        <p className="text-sm text-cream-dim">No get in touch submissions yet.</p>
      )}
    </div>
  );
}
