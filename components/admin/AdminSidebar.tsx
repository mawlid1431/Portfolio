"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import GlassButton from "@/components/GlassButton";
import { ADMIN_NAV, type AdminTab } from "@/lib/admin-nav";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "admin-sidebar-collapsed";

function subscribeLargeScreen(onStoreChange: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getLargeScreenSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getLargeScreenServerSnapshot() {
  return false;
}

function readCollapsedPreference() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

type AdminSidebarProps = {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  tab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(readCollapsedPreference);
  const isLargeScreen = useSyncExternalStore(
    subscribeLargeScreen,
    getLargeScreenSnapshot,
    getLargeScreenServerSnapshot,
  );

  const iconOnly = !isLargeScreen || collapsed;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-[100dvh] shrink-0 flex-col border-r border-cream/10 bg-ink-soft/80 backdrop-blur-md transition-[width] duration-300",
        iconOnly ? "w-[4.5rem]" : "w-60",
      )}
    >
      <div
        className={cn(
          "border-b border-cream/10",
          iconOnly ? "flex justify-center p-3" : "p-5",
        )}
      >
        <Link
          href="/"
          className={cn(
            "font-display text-cream",
            iconOnly ? "text-lg" : "text-xl",
          )}
          title="MALITOS home"
        >
          M<span className="text-emerald-bright">.</span>
          {!iconOnly && (
            <>
              ALITOS<span className="text-emerald-bright">.</span>
            </>
          )}
        </Link>
        {!iconOnly && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream-dim">
            Devmalitos CMS
          </p>
        )}
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto py-3",
          iconOnly ? "items-center px-2" : "px-3",
        )}
        aria-label="Admin sections"
      >
        {ADMIN_NAV.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              title={iconOnly ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "flex min-h-11 items-center rounded-xl text-sm transition-colors",
                iconOnly
                  ? "w-11 justify-center px-0"
                  : "w-full gap-3 px-4 py-3 text-left",
                active
                  ? "bg-emerald-glow/15 text-emerald-bright"
                  : "text-cream-dim hover:bg-cream/5 hover:text-cream",
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {!iconOnly && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "flex flex-col gap-2 border-t border-cream/10 p-3",
          iconOnly && "items-center",
        )}
      >
        {isLargeScreen && (
          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className={cn(
              "flex min-h-10 items-center rounded-xl text-cream-dim transition-colors hover:bg-cream/5 hover:text-cream",
              iconOnly ? "w-11 justify-center" : "w-full gap-3 px-4",
            )}
          >
            <span className="text-base leading-none">{collapsed ? "»" : "«"}</span>
            {!iconOnly && (
              <span className="text-xs uppercase tracking-[0.15em]">
                {collapsed ? "Expand" : "Collapse"}
              </span>
            )}
          </button>
        )}

        <GlassButton
          type="button"
          variant="danger"
          size={iconOnly ? "icon" : "md"}
          className={iconOnly ? "" : "w-full justify-start"}
          onClick={onLogout}
          title={iconOnly ? "Log out" : undefined}
        >
          <span>⏻</span>
          {!iconOnly && <span>Log out</span>}
        </GlassButton>
      </div>
    </aside>
  );
}
