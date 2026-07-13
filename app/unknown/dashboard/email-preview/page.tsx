"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EmailPreviewPanel from "@/components/admin/EmailPreviewPanel";
import { useAdminSession } from "@/lib/admin-hooks";

export default function AdminEmailPreviewPage() {
  const router = useRouter();
  const { admin, loading } = useAdminSession();

  useEffect(() => {
    if (!loading && !admin) router.replace("/unknown");
  }, [loading, admin, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-cream-dim">Loading…</p>
      </main>
    );
  }

  if (!admin) return null;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-3xl">
              MALITOS<span className="text-emerald-bright">.</span>
            </p>
            <h1 className="mt-2 text-xs uppercase tracking-[0.3em] text-cream-dim">
              Email templates
            </h1>
          </div>
          <Link
            href="/unknown/dashboard"
            className="text-xs text-cream-dim underline hover:text-emerald-bright"
          >
            Back to dashboard
          </Link>
        </div>

        <EmailPreviewPanel canSendTest adminEmail={admin.email} />
      </div>
    </main>
  );
}
