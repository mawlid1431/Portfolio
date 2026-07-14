"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
} from "@/components/admin/AdminIcons";
import {
  ADMIN_NAV,
  isAdminNavSectionStart,
  type AdminTab,
} from "@/lib/admin-nav";
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
    <motion.aside
      animate={{ width: iconOnly ? 80 : 272 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--card-bg)]"
    >
      <div
        className={cn(
          "flex border-b border-[var(--border-subtle)]",
          iconOnly
            ? "flex-col items-center gap-2 p-3"
            : "items-start justify-between gap-2 p-4",
        )}
      >
        <div className={cn("min-w-0", iconOnly && "text-center")}>
          <Link
            href="/"
            className={cn(
              "font-display whitespace-nowrap text-[var(--admin-text)]",
              iconOnly ? "text-lg" : "text-xl",
            )}
            title="MALITOS home"
          >
            M<span className="text-secondary">.</span>
            {!iconOnly && (
              <>
                ALITOS<span className="text-secondary">.</span>
              </>
            )}
          </Link>
          {!iconOnly && (
            <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-faint)]">
              Devmalitos CMS
            </p>
          )}
        </div>

        {isLargeScreen && (
          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--admin-text-dim)] transition-colors hover:border-secondary/40 hover:bg-[var(--admin-hover-bg)] hover:text-secondary"
          >
            {collapsed ? (
              <IconChevronRight className="h-4 w-4" />
            ) : (
              <IconChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <nav
        className="admin-sidebar-nav min-h-0 flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Admin sections"
      >
        {ADMIN_NAV.map((item, index) => {
          const active = tab === item.key;
          const Icon = item.icon;
          return (
            <div key={item.key}>
              {!iconOnly && isAdminNavSectionStart(index) && (
                <p className="mb-2 mt-4 whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--admin-text-faint)] first:mt-0">
                  {item.section}
                </p>
              )}
              <button
                type="button"
                title={iconOnly ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => onTabChange(item.key)}
                className={cn(
                  "admin-nav-link group relative flex w-full rounded-lg transition duration-200",
                  iconOnly
                    ? "items-center justify-center px-2 py-2.5"
                    : "items-start gap-3 px-3 py-2.5 text-left hover:translate-x-0.5",
                  active && "admin-nav-link--active",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="admin-nav-indicator absolute inset-0 rounded-lg border"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex shrink-0 items-center justify-center rounded-md border transition-colors",
                    iconOnly ? "h-9 w-9" : "h-8 w-8",
                    active
                      ? "border-secondary bg-secondary/15 text-secondary"
                      : "border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--admin-text-dim)] group-hover:border-secondary/40 group-hover:text-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {!iconOnly && (
                  <span className="relative z-10 min-w-0">
                    <span className="block whitespace-nowrap text-sm font-medium text-[var(--admin-text)]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block whitespace-nowrap text-xs text-[var(--admin-text-faint)] group-hover:text-[var(--admin-text-dim)]">
                      {item.description}
                    </span>
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-[var(--border-subtle)] p-3",
          iconOnly && "flex justify-center",
        )}
      >
        <button
          type="button"
          onClick={onLogout}
          title={iconOnly ? "Log out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] text-sm font-medium text-[var(--admin-text-dim)] transition-colors hover:border-red-500/40 hover:text-red-400",
            iconOnly ? "h-9 w-9 justify-center" : "w-full px-3 py-2.5",
          )}
        >
          <IconLogout className="h-4 w-4 shrink-0" />
          {!iconOnly && <span className="whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
