"use client";

import { useRef, useState } from "react";
import { useInView } from "./useSectionProgress";
import type { PublicFaq } from "@/lib/cms-server";

export default function Faq({ items }: { items: PublicFaq[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.15);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section ref={ref} className="py-32">
      <div className="mx-auto max-w-4xl px-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
          Got questions?
        </p>
        <h2 className="font-display mt-4 text-5xl uppercase md:text-7xl">
          FAQ
        </h2>

        <div className="mt-14 flex flex-col">
          {items.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={f.q}
                className="border-b border-cream/10"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex min-h-12 w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-lg uppercase md:text-2xl">
                    {f.q}
                  </span>
                  <span
                    className={`font-display text-2xl text-emerald-bright transition-transform duration-300 ${open ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-sm leading-relaxed text-cream-dim md:text-base">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
