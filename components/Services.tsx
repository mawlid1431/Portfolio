"use client";

import { useRef } from "react";
import GlassButton from "./GlassButton";
import { useInView } from "./useSectionProgress";
import { SERVICES } from "@/lib/data";

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.2);

  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
          Services I provide
        </p>
        <h2 className="font-display mt-4 text-5xl uppercase md:text-7xl">
          Work with me
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <div
              key={s.tier}
              className={`work-card relative flex flex-col rounded-2xl border p-10 ${
                s.highlight
                  ? "border-emerald-glow/60 bg-emerald-glow/5"
                  : "border-cream/15 bg-ink-soft/60"
              }`}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 0.7s ease ${i * 0.15}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
              }}
            >
              {s.highlight && (
                <span className="glass-pill glass-pill-accent absolute -top-3 right-8">
                  Most popular
                </span>
              )}
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
                {s.tier}
              </span>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-4xl md:text-5xl">
                  {s.price}
                </span>
              </div>
              <h3 className="mt-2 text-lg text-cream-dim">{s.title}</h3>

              <ul className="mt-8 flex flex-col gap-3">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-bright">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <GlassButton
                href="/contact"
                variant={s.highlight ? "accent" : "ghost"}
                size="sm"
                className="mt-10 w-full"
              >
                Book now
              </GlassButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
