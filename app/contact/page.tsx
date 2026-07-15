import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GlassButton from "@/components/GlassButton";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/data";
import { fetchPublicSocials } from "@/lib/cms-server";
import { fetchSiteImageMap, resolveSiteImage } from "@/lib/images-server";

export const metadata: Metadata = {
  title: "Get in touch",
  description:
    "Let's create something amazing together. Reach out and let's start building your vision.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const [images, socials] = await Promise.all([
    fetchSiteImageMap(),
    fetchPublicSocials(),
  ]);
  const workingSrc = resolveSiteImage(images, "working", 900);

  return (
    <main className="pt-28">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
            Get in touch
          </p>
          <h1 className="font-display mt-4 text-5xl uppercase leading-none md:text-8xl">
            Let&apos;s start <span className="text-emerald-bright">building</span>
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* info card */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-glow/25 bg-ink-soft/70">
              <div className="relative h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={workingSrc}
                  alt="Mowlid working"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-soft to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-6 p-8">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-bright opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-bright" />
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-emerald-bright">
                    Available for hire
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cream-dim">
                    Email
                  </p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="mt-1 block text-lg transition-colors hover:text-emerald-bright"
                  >
                    {SITE.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cream-dim">
                    Based in
                  </p>
                  <p className="mt-1 text-lg">
                    {SITE.location} — working worldwide
                  </p>
                </div>

                <div className="mt-auto">
                  <p className="text-xs uppercase tracking-[0.3em] text-cream-dim">
                    Find me on
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {socials.map((s) => (
                      <GlassButton
                        key={s.label}
                        href={s.href}
                        external
                        variant="ghost"
                        size="sm"
                        className="normal-case tracking-[0.15em]"
                      >
                        {s.label}
                      </GlassButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* form */}
          <Reveal delay={0.2}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
