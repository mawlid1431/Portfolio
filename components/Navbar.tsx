"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import CvPreviewModal from "./CvPreviewModal";
import GlassButton from "./GlassButton";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Get in touch", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;
  const [scrolled, setScrolled] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const cv = useQuery(api.cv.getPublic);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname.startsWith("/unknown")) return null;

  const openCv = () => {
    setOpenForPath(null);
    setCvOpen(true);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-safe transition-all duration-500 ${
          scrolled
            ? "border-b border-emerald-glow/20 bg-ink/85 py-3 backdrop-blur-md"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-2xl tracking-wide text-cream"
          >
            MALITOS<span className="text-emerald-bright">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-xs uppercase tracking-[0.25em] transition-colors hover:text-emerald-bright ${
                  pathname === l.href ? "text-emerald-bright" : "text-cream-dim"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <GlassButton
              type="button"
              variant="accent"
              size="sm"
              onClick={openCv}
            >
              CV
            </GlassButton>
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpenForPath(open ? null : pathname)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl"
            >
              <span className="relative flex h-5 w-6 flex-col justify-center">
                <span
                  className={`absolute h-0.5 w-6 bg-cream transition-transform ${open ? "rotate-45" : "-translate-y-2"}`}
                />
                <span
                  className={`absolute h-0.5 w-6 bg-cream transition-opacity ${open ? "opacity-0" : ""}`}
                />
                <span
                  className={`absolute h-0.5 w-6 bg-cream transition-transform ${open ? "-rotate-45" : "translate-y-2"}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      {open && (
        <button
          type="button"
          aria-label="Close menu backdrop"
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpenForPath(null)}
        />
      )}
      <div
        id="mobile-nav"
        className={`fixed inset-x-0 top-0 z-[45] max-h-[100dvh] overflow-y-auto bg-ink/98 pb-safe pt-20 transition-transform duration-300 md:hidden ${
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-2 px-6 py-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpenForPath(null)}
              className={`min-h-12 rounded-xl px-4 py-3 font-display text-2xl uppercase transition-colors ${
                pathname === l.href
                  ? "bg-emerald-glow/10 text-emerald-bright"
                  : "text-cream"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <GlassButton
            type="button"
            variant="accent"
            size="md"
            className="mt-4 w-full"
            onClick={openCv}
          >
            CV
          </GlassButton>
        </nav>
      </div>

      <CvPreviewModal
        open={cvOpen}
        onClose={() => setCvOpen(false)}
        cv={cv}
      />
    </>
  );
}
