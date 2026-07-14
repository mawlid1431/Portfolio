"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

function shouldUseSmoothScroll(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Touch devices: native scroll feels better than Lenis
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return false;
  return true;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The admin dashboard scrolls inside nested containers; Lenis would
  // swallow the mouse wheel there, so it stays native on /unknown routes.
  const isAdminRoute = pathname?.startsWith("/unknown") ?? false;

  useEffect(() => {
    if (isAdminRoute || !shouldUseSmoothScroll()) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isAdminRoute]);

  return <>{children}</>;
}
