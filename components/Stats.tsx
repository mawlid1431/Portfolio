"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "./useSectionProgress";

const STATS = [
  { value: 30, suffix: "+", label: "Live projects in production" },
  { value: 3, suffix: "+", label: "Years of experience" },
  { value: 15, suffix: "+", label: "Happy clients" },
  { value: 5, suffix: "+", label: "Global hackathons" },
];

function Counter({
  target,
  suffix,
  start,
}: {
  target: number;
  suffix: string;
  start: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    const duration = 1600;
    const t0 = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [start, target]);

  return (
    <span className="font-display text-6xl text-emerald-bright md:text-8xl">
      {value}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.4);

  return (
    <section ref={ref} className="relative border-y border-emerald-glow/15">
      {/* marquee backdrop */}
      <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.04]">
        <div className="marquee-track flex shrink-0 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="font-display px-8 text-[10rem]">
              BUILD A STORY FOR EVERYDAY — BUILD A STORY FOR EVERYDAY —
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-12 px-6 py-28 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-3 text-center"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`,
            }}
          >
            <Counter target={s.value} suffix={s.suffix} start={inView} />
            <span className="text-xs uppercase tracking-[0.25em] text-cream-dim">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
