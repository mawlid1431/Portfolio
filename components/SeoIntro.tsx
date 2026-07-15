import Link from "next/link";
import { seoLongDescription } from "@/lib/seo-keywords";

/** Visible crawlable copy — Google ranks page text, not meta keywords alone. */
export default function SeoIntro() {
  return (
    <section
      aria-label="About Mowlid Haibe"
      className="border-b border-emerald-glow/10 bg-ink-soft/30 py-14"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-bright">
          Malitos · Devmalitos
        </p>
        <h2 className="font-display mt-3 text-2xl uppercase leading-tight md:text-4xl">
          Mowlid Haibe — Full-stack developer &amp; AI innovator
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-cream-dim md:text-base">
          {seoLongDescription}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-cream-dim md:text-base">
          Explore my{" "}
          <Link href="/projects" className="text-emerald-bright hover:underline">
            portfolio
          </Link>
          , read{" "}
          <Link href="/about" className="text-emerald-bright hover:underline">
            about Mowlid
          </Link>
          , or{" "}
          <Link href="/contact" className="text-emerald-bright hover:underline">
            hire me for your next project
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
