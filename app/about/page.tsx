import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GlassButton from "@/components/GlassButton";
import Reveal from "@/components/Reveal";
import ScrollZoomReveal from "@/components/ScrollZoomReveal";
import { HIGHLIGHTS } from "@/lib/data";
import {
  fetchPublicEducation,
  fetchPublicExperiences,
  fetchPublicSkills,
} from "@/lib/cms-server";
import { fetchSiteImageMap, resolveSiteImage, resolveSiteVideo } from "@/lib/images-server";
import { glassButtonClasses } from "@/lib/glass-button-classes";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "About",
  description:
    "Software Engineer and AI Innovator from Somaliland, based in Malaysia. 30+ live projects in production.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const [images, experience, education, techStack] = await Promise.all([
    fetchSiteImageMap(),
    fetchPublicExperiences(),
    fetchPublicEducation(),
    fetchPublicSkills(),
  ]);
  const flagSrc = resolveSiteImage(images, "flag", 1000);
  const graduationSrc = resolveSiteImage(images, "graduation", 1000);
  const showreelSrc = resolveSiteVideo(images, "about-showreel");

  return (
    <main className="pt-28">
      {/* intro */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
            👋 Hi, I&apos;m Mowlid Haibe
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-5xl uppercase leading-none md:text-8xl">
            Software that serves{" "}
            <span className="text-emerald-bright">people</span>
          </h1>
        </Reveal>
      </section>

      <ScrollZoomReveal
        videoSrc={showreelSrc}
        posterSrc={flagSrc}
        leftText="Malitos"
        rightText="My story"
        buttonText="Play showreel"
      />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="rim-glow overflow-hidden rounded-2xl border border-emerald-glow/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagSrc}
                alt="Mowlid holding the Somaliland flag"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex h-full flex-col justify-center gap-6 text-cream-dim">
              <p>
                I&apos;m a Software Engineer and AI Innovator bridging the gap
                between modern design, system architecture, and artificial
                intelligence. I specialize in end-to-end development across
                web, mobile, and intelligent systems — building scalable
                applications for startups, nonprofits, and community-driven
                organizations.
              </p>
              <p>
                Originally from Somaliland, proudly graduated from the rigorous
                ALX Software Engineering Program, and currently advancing my
                Bachelor of Computer Science in Malaysia. With over 30 live
                projects in production, I bring a product-first mindset to
                engineering.
              </p>
              <p>
                Beyond development, I actively contribute to youth empowerment,
                entrepreneurship training, and mental health initiatives —
                using technology as a tool for positive change. I believe great
                software should not only work well, but also serve people and
                communities.
              </p>
              <p className="font-display text-xl uppercase text-emerald-bright">
                &ldquo;Build a story for everyday&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* what I bring to the table */}
      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
              Software Engineer | AI Innovator | 30+ live projects
            </p>
            <h2 className="font-display mt-4 text-4xl uppercase md:text-6xl">
              What I bring to the table
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-2xl border border-cream/10 bg-ink-soft/70 p-7 transition-colors hover:border-emerald-glow/40">
                  <span className="text-3xl">{h.icon}</span>
                  <h3 className="font-display mt-4 text-xl uppercase">
                    {h.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                    {h.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* experience */}
      {experience.length > 0 && (
      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
              Career
            </p>
            <h2 className="font-display mt-4 text-4xl uppercase md:text-6xl">
              Work experience
            </h2>
          </Reveal>

          <div className="mt-14 flex flex-col">
            {experience.map((e, i) => (
              <Reveal key={e.role + e.org} delay={i * 0.08}>
                <div className="grid gap-4 border-b border-cream/10 py-10 md:grid-cols-[1fr_2fr]">
                  <div>
                    <h3 className="font-display text-2xl uppercase md:text-3xl">
                      {e.role}
                    </h3>
                    <p className="mt-2 text-sm text-emerald-bright">{e.org}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cream-dim">
                      {e.period}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-cream-dim md:text-base">
                    {e.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* education */}
      {education.length > 0 && (
      <section className="relative overflow-hidden border-t border-cream/10 py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 opacity-40 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={graduationSrc}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
              Learning never stops
            </p>
            <h2 className="font-display mt-4 text-4xl uppercase md:text-6xl">
              Education
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:max-w-2xl">
            {education.map((ed, i) => (
              <Reveal key={ed.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-cream/10 bg-ink-soft/70 p-6 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl uppercase">
                      {ed.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-emerald-glow/40 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-emerald-bright">
                      {ed.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-bright">{ed.org}</p>
                  <p className="mt-2 text-sm text-cream-dim">{ed.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* tech stack */}
      {techStack.length > 0 && (
      <section className="border-t border-cream/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
              Technical arsenal
            </p>
            <h2 className="font-display mt-4 text-4xl uppercase md:text-6xl">
              My tech stack
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((g, i) => (
              <Reveal key={g.group} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-cream/10 bg-ink-soft/70 p-6">
                  <h3 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
                    {g.group}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {g.items.map((t) => (
                      <span
                        key={t}
                        className={cn(
                          glassButtonClasses({ variant: "ghost", size: "sm" }),
                          "pointer-events-none normal-case tracking-normal font-normal",
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* cta */}
      <section className="border-t border-cream/10 py-24 text-center">
        <Reveal>
          <h2 className="font-display text-4xl uppercase md:text-6xl">
            Projects around <span className="text-emerald-bright">the world</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-cream-dim">
            Worked across Europe, the Middle East, Africa, and Asia.
          </p>
          <GlassButton href="/contact" variant="accent" size="md" className="mt-10">
            Get in touch
          </GlassButton>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
