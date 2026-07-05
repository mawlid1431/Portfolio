"use client";

import { useEffect, useState } from "react";
import { glassButtonClasses } from "@/lib/glass-button-classes";
import { cn } from "@/lib/cn";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(glassButtonClasses({ variant: "ghost", size: "icon" }))}
    >
      {/* render both icons only after mount to avoid hydration mismatch */}
      {mounted && (
        <span className="text-base leading-none" aria-hidden>
          {light ? "☾" : "☀"}
        </span>
      )}
    </button>
  );
}
