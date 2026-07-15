import Link from "next/link";
import { fetchPublicSocials } from "@/lib/cms-server";

export default async function Footer() {
  const socials = await fetchPublicSocials();

  return (
    <footer className="border-t border-cream/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-display text-xl">
            MALITOS<span className="text-emerald-bright">.</span>
          </p>
          <p className="mt-1 text-xs text-cream-dim">
            Mowlid Haibe · Malitos · Devmalitos — full-stack developer, Malaysia
          </p>
          <p className="mt-1 text-xs text-cream-dim">
            © {new Date().getFullYear()} Mowlid Haibe. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-[0.2em] text-cream-dim transition-colors hover:text-emerald-bright"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center px-2 text-xs text-cream-dim transition-colors hover:text-emerald-bright"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center px-2 text-xs text-cream-dim transition-colors hover:text-emerald-bright"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
