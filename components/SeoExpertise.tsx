import Link from "next/link";
import { expertiseHighlights } from "@/lib/seo-keywords";

/** Crawlable expertise tags tied to real projects & experience */
export default function SeoExpertise() {
  return (
    <section
      aria-label="Expertise and services"
      className="border-b border-emerald-glow/10 py-12"
    >
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-emerald-bright">
          Expertise
        </p>
        <h2 className="font-display mt-3 text-center text-xl uppercase md:text-3xl">
          Trending skills from my projects &amp; experience
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-cream-dim">
          AI agents, intelligent CRM, nonprofit &amp; charity websites, fintech
          billing, Umrah travel platforms, community apps, education sites, and
          startup MVPs — built with Next.js, React, TypeScript, React Native,
          Convex, OpenAI, Claude, and Stripe.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {expertiseHighlights.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="inline-block rounded-full border border-emerald-glow/25 bg-ink-soft/50 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cream-dim transition-colors hover:border-emerald-bright/50 hover:text-emerald-bright"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
