"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconLogout, IconX } from "@/components/admin/AdminIcons";
import { ADMIN_NAV, isAdminNavSectionStart, type AdminTab } from "@/lib/admin-nav";
import { cn } from "@/lib/cn";

type AdminMobileNavProps = {
  open: boolean;
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onClose: () => void;
  onLogout: () => void;
};

export default function AdminMobileNav({
  open,
  tab,
  onTabChange,
  onClose,
  onLogout,
}: AdminMobileNavProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute left-0 top-0 flex h-full w-[min(100vw-3rem,18rem)] flex-col border-r border-[var(--border-subtle)] bg-charcoal"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
              <div className="min-w-0">
                <Link
                  href="/"
                  className="font-display text-xl text-[var(--admin-text)]"
                  onClick={onClose}
                >
                  M<span className="text-secondary">.</span>ALITOS
                  <span className="text-secondary">.</span>
                </Link>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-faint)]">
                  Devmalitos CMS
                </p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--admin-text-dim)] transition-colors hover:border-secondary/40 hover:text-secondary"
              >
                <IconX className="h-4 w-4" />
              </button>
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
                    {isAdminNavSectionStart(index) && (
                      <p className="mb-2 mt-4 px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--admin-text-faint)] first:mt-0">
                        {item.section}
                      </p>
                    )}
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => {
                        onTabChange(item.key);
                        onClose();
                      }}
                      className={cn(
                        "admin-nav-link relative flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition duration-200",
                        active && "admin-nav-link--active",
                      )}
                    >
                      {active && (
                        <span
                          className="admin-nav-indicator absolute inset-0 rounded-lg border"
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                          active
                            ? "border-secondary bg-secondary/15 text-secondary"
                            : "border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--admin-text-dim)]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="relative z-10 min-w-0">
                        <span className="block text-sm font-medium text-[var(--admin-text)]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--admin-text-faint)]">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-[var(--border-subtle)] p-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] px-3 py-2.5 text-sm font-medium text-[var(--admin-text-dim)] transition-colors hover:border-red-500/40 hover:text-red-400"
              >
                <IconLogout className="h-4 w-4 shrink-0" />
                Log out
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
