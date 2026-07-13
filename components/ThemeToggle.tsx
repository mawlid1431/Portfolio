"use client";

import { useSyncExternalStore } from "react";
import { glassButtonClasses } from "@/lib/glass-button-classes";
import { cn } from "@/lib/cn";

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("light");
}

function getServerThemeSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const light = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggle = () => {
    const next = !light;
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
      {mounted && (
        <span className="text-base leading-none" aria-hidden>
          {light ? "☾" : "☀"}
        </span>
      )}
    </button>
  );
}
