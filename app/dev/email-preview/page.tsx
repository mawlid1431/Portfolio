import { notFound } from "next/navigation";
import Link from "next/link";
import EmailPreviewPanel from "@/components/admin/EmailPreviewPanel";

export default function DevEmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-3xl">
              MALITOS<span className="text-emerald-bright">.</span>
            </p>
            <h1 className="mt-2 text-xs uppercase tracking-[0.3em] text-cream-dim">
              Email template preview
            </h1>
            <p className="mt-2 text-xs text-amber-400/90">
              Development only — not available in production.
            </p>
          </div>
          <Link
            href="/unknown"
            className="text-xs text-cream-dim underline hover:text-emerald-bright"
          >
            Back to admin
          </Link>
        </div>

        <EmailPreviewPanel />
      </div>
    </main>
  );
}
