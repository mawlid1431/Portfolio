"use client";

import { useRef } from "react";
import WavyTicker from "./WavyTicker";
import { useInView } from "./useSectionProgress";
import { TESTIMONIALS, type TestimonialItem } from "@/lib/data";

function TestimonialCard({ quote, author, role }: TestimonialItem) {
  return (
    <article className="flex h-full w-[min(420px,78vw)] shrink-0 flex-col justify-center rounded-2xl border border-cream/20 bg-ink-soft px-8 py-6 backdrop-blur-sm">
      <span className="font-display text-4xl leading-none text-emerald-glow/55">
        &ldquo;
      </span>
      <p className="mt-2 text-sm leading-relaxed text-cream md:text-[15px]">
        {quote}
      </p>
      <div className="mt-5 border-t border-cream/15 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-bright">
          {author}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cream-dim">
          {role}
        </p>
      </div>
    </article>
  );
}

export default function Testimonial() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.2);

  const items = TESTIMONIALS.map((item, index) => (
    <TestimonialCard key={`${item.author}-${index}`} {...item} />
  ));

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-emerald-glow/15 py-20 md:py-28">
      <div
        className="mx-auto max-w-6xl px-6"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <p className="text-center text-xs uppercase tracking-[0.4em] text-emerald-bright">
          Client stories
        </p>
        <h2 className="font-display mt-4 text-center text-4xl uppercase md:text-6xl">
          What people <span className="text-emerald-bright">say</span>
        </h2>
      </div>

      <div
        className="mt-14 space-y-6 md:mt-16"
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 1s ease 0.15s",
        }}
      >
        <WavyTicker
          items={items}
          direction="left"
          speed={45}
          waveStyle="wavy"
          waveAmplitude={18}
          waveFrequency={0.004}
          itemSize={168}
          gap={28}
          padding={24}
          fadeEdges
          fadeDistance={12}
          slowdownOnHover={0.25}
        />
        <WavyTicker
          items={[...items].reverse()}
          direction="right"
          speed={38}
          waveStyle="wavy"
          waveAmplitude={14}
          waveFrequency={0.005}
          itemSize={168}
          gap={28}
          padding={12}
          fadeEdges
          fadeDistance={12}
          slowdownOnHover={0.25}
        />
      </div>
    </section>
  );
}
