"use client";

import { useRef, useState } from "react";
import Portrait from "./Portrait";
import { useSectionProgress } from "./useSectionProgress";
import { IMAGES } from "@/lib/data";

const NAME = "MOWLID HAIBE";

export default function Hero({ heroSrc = IMAGES.hero }: { heroSrc?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // letters track in across the first 60% of the scroll
  const letterProgress = Math.min(1, progress / 0.6);
  const visibleLetters = Math.floor(letterProgress * NAME.length);

  // portrait "orbit": slight rotation + scale as you scroll
  const rotate = (progress - 0.5) * 14; // -7deg → +7deg
  const scale = 1 + progress * 0.12;
  const parallaxY = progress * -60;

  // subtitle + scroll cue fade
  const subtitleOpacity = Math.min(1, Math.max(0, (progress - 0.55) / 0.25));
  const cueOpacity = 1 - Math.min(1, progress / 0.2);

  const onMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    setTilt({
      x: (e.clientX / innerWidth - 0.5) * 8,
      y: (e.clientY / innerHeight - 0.5) * -8,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[220vh] md:h-[300vh]"
      onMouseMove={onMouseMove}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        {/* ambient emerald orbs */}
        <div className="orb absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-emerald-glow/10 blur-3xl" />
        <div
          className="orb absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-emerald-glow/10 blur-3xl"
          style={{ animationDelay: "-7s" }}
        />

        {/* portrait */}
        <div
          className="relative z-10 will-change-transform"
          style={{
            transform: `perspective(1000px) rotateY(${rotate + tilt.x}deg) rotateX(${tilt.y}deg) translateY(${parallaxY}px) scale(${scale})`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <div className="rim-glow relative h-[46vh] w-[32vh] overflow-hidden rounded-2xl border border-emerald-glow/30 md:h-[56vh] md:w-[40vh]">
            <Portrait
              src={heroSrc}
              alt="Mowlid Haibe"
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </div>
        </div>

        {/* massive name — tracks in letter by letter */}
        <h1
          className="font-display pointer-events-none absolute z-20 flex select-none flex-wrap justify-center text-[11vw] leading-none tracking-tight sm:text-[10vw] md:text-[11vw]"
          style={{ perspective: "600px" }}
        >
          {NAME.split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: i < visibleLetters ? 1 : 0,
                animation:
                  i < visibleLetters
                    ? "letter-in 0.5s cubic-bezier(0.22,1,0.36,1) both"
                    : "none",
                textShadow:
                  "0 0 40px color-mix(in srgb, var(--emerald-glow) 35%, transparent)",
                whiteSpace: "pre",
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* subtitle */}
        <p
          className="absolute bottom-[16%] z-20 max-w-xl px-6 text-center text-sm uppercase tracking-[0.3em] text-cream-dim md:text-base"
          style={{ opacity: subtitleOpacity }}
        >
          Software Engineer &amp; AI Innovator — Malitos · Devmalitos portfolio
        </p>

        {/* scroll cue */}
        <div
          className="absolute bottom-8 z-20 flex flex-col items-center gap-2 text-emerald-bright"
          style={{ opacity: cueOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">
            Scroll
          </span>
          <span className="block h-8 w-px animate-pulse bg-emerald-bright" />
        </div>
      </div>
    </section>
  );
}
