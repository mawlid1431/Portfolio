"use client";

import { useRef } from "react";
import Portrait from "./Portrait";
import { useSectionProgress } from "./useSectionProgress";

import { PILLARS, IMAGES } from "@/lib/data";

export default function Pillars({
  workingSrc = IMAGES.working,
}: {
  workingSrc?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);

  return (
    <section ref={sectionRef} className="relative h-[250vh] md:h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* backdrop portrait — the builder */}
        <div
          className="absolute inset-y-0 right-0 w-full opacity-35 md:w-1/2 md:opacity-70"
          style={{ transform: `scale(${1.05 + progress * 0.1})` }}
        >
          <Portrait
            src={workingSrc}
            alt="Mowlid at work"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/10" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <p className="mb-10 text-xs uppercase tracking-[0.4em] text-emerald-bright">
            What I do
          </p>

          <div className="flex flex-col gap-8 md:gap-10">
            {PILLARS.map((p, i) => {
              // each pillar owns an equal share of the scroll, revealed one at a time
              const step = 0.8 / PILLARS.length;
              const local = Math.min(
                1,
                Math.max(0, (progress - i * step) / (step * 0.8)),
              );
              return (
                <div
                  key={p.n}
                  className="flex items-start gap-6 md:gap-10"
                  style={{
                    opacity: local,
                    transform: `translateX(${(1 - local) * -60}px)`,
                  }}
                >
                  <span className="font-display mt-1 text-xl text-emerald-glow/60 md:text-3xl">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl uppercase leading-tight md:text-5xl">
                      {p.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm text-cream-dim md:text-base">
                      {p.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
