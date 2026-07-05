"use client";

import { useRef } from "react";
import GlassButton from "./GlassButton";
import { useInView } from "./useSectionProgress";

export default function Finale() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.3);

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-32">
      <div className="orb absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-glow/10 blur-3xl" />

      <div
        className="relative z-10 mx-auto max-w-5xl rounded-3xl border border-emerald-glow/25 bg-ink-soft/60 px-8 py-20 text-center backdrop-blur md:py-28"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
          We are inspired
        </p>
        <h2 className="font-display mt-6 text-5xl uppercase leading-none md:text-8xl">
          Let&apos;s create
          <br />
          <span className="text-emerald-bright">something amazing</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm text-cream-dim md:text-base">
          Reach out and let&apos;s start building your vision — together.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <GlassButton href="/contact" variant="accent" size="md">
            Get in touch
          </GlassButton>
          <GlassButton href="/projects" variant="ghost" size="md">
            View work
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
