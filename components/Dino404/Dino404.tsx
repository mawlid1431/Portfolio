"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import GlassButton from "@/components/GlassButton";
import Dino404Game from "./Dino404Game";

function subscribeTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function isLightTheme() {
  return document.documentElement.classList.contains("light");
}

export default function Dino404() {
  const light = useSyncExternalStore(subscribeTheme, isLightTheme, () => false);

  const gameColors = light
    ? {
        bgColor: "#fdfaf2",
        dinoColor: "#047857",
        obstacleColor: "#0d9f6e",
        groundColor: "rgba(4,120,87,0.35)",
        scoreColor: "#16150f",
        hintColor: "rgba(22,21,15,0.45)",
        borderColor: "rgba(13,159,110,0.2)",
      }
    : {
        bgColor: "#0e0f0e",
        dinoColor: "#34d399",
        obstacleColor: "#10b981",
        groundColor: "rgba(52,211,153,0.35)",
        scoreColor: "#f4eee1",
        hintColor: "rgba(244,238,225,0.45)",
        borderColor: "rgba(16,185,129,0.15)",
      };

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center px-6 pb-20 pt-28 md:pt-32">
      <div
        aria-hidden
        className="orb pointer-events-none absolute left-1/2 top-1/3 h-[40vh] w-[60vw] max-w-xl -translate-x-1/2 rounded-full bg-emerald-glow/10 blur-3xl"
      />

      <p className="relative text-xs uppercase tracking-[0.4em] text-emerald-bright">
        Page not found
      </p>

      <h1
        className="font-display relative mt-4 select-none text-center leading-[0.85] tracking-tight text-cream"
        style={{
          fontSize: "clamp(5.5rem, 26vw, 14rem)",
          textShadow:
            "0 0 60px color-mix(in srgb, var(--emerald-glow) 25%, transparent)",
        }}
      >
        404
      </h1>

      <p className="relative mt-6 max-w-lg text-center text-sm leading-relaxed text-cream-dim md:text-base">
        This URL doesn&apos;t exist — but you can jump your way home with the
        dino below, or head straight back to the site.
      </p>

      <div className="relative mt-10 w-full max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-emerald-glow/25 bg-ink-soft p-3 backdrop-blur md:p-4">
          <div className="w-full" style={{ aspectRatio: "800/260" }}>
            <Dino404Game {...gameColors} borderRadius={12} />
          </div>
        </div>
      </div>

      <div className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <GlassButton href="/" variant="accent" size="lg">
          Go back home
        </GlassButton>
        <GlassButton href="/projects" variant="ghost" size="md">
          View projects
        </GlassButton>
      </div>

      <p className="relative mt-8 text-center text-xs text-cream-dim">
        Or try{" "}
        <Link href="/contact" className="text-emerald-bright hover:underline">
          Get in touch
        </Link>{" "}
        if you think this is a mistake.
      </p>
    </section>
  );
}
