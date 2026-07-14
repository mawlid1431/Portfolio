"use client";

import Link from "next/link";
import { useRef } from "react";
import ProjectCard from "./ProjectCard";
import Portrait from "./Portrait";
import { useInView } from "./useSectionProgress";
import { IMAGES } from "@/lib/data";
import type { PublicProject } from "@/lib/projects";

export default function Work({
  featured = [],
  portraitSrc = IMAGES.portrait,
}: {
  featured?: PublicProject[];
  portraitSrc?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, 0.15);

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* backdrop */}
      <div className="absolute inset-0 opacity-25">
        <Portrait src={portraitSrc} alt="" className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/50 to-ink" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
              Selected work
            </p>
            <h2 className="font-display mt-4 text-5xl uppercase md:text-8xl">
              Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden text-xs uppercase tracking-[0.3em] text-cream-dim transition-colors hover:text-emerald-bright md:block"
          >
            View all →
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {featured.map((p, i) => (
            <div
              key={p.slug}
              className="transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(50px)",
                transitionDelay: `${i * 0.15}s`,
              }}
            >
              <ProjectCard project={p} />
            </div>
          ))}
        </div>

        <Link
          href="/projects"
          className="mt-10 block text-center text-xs uppercase tracking-[0.3em] text-cream-dim md:hidden"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
}
