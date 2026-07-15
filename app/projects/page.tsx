import type { Metadata } from "next";
import Footer from "@/components/Footer";
import GlassButton from "@/components/GlassButton";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import { fetchPublicProjects } from "@/lib/projects-server";
import { seoProjectsDescription } from "@/lib/seo-keywords";

export const metadata: Metadata = {
  title: "Projects by Mowlid Haibe",
  description: seoProjectsDescription,
  alternates: { canonical: "/projects" },
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await fetchPublicProjects();

  return (
    <main className="pt-28">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-bright">
            Successful projects
          </p>
          <h1 className="font-display mt-4 text-5xl uppercase leading-none md:text-8xl">
            Devmalitos <span className="text-emerald-bright">projects</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm text-cream-dim md:text-base">
            Portfolio by Mowlid Haibe (Malitos): AI apps like CallBack AI &amp; Pure
            CRM, nonprofit sites like Mubarak Charity, fintech with BarkulanFintech,
            travel platforms like SkyDanubia, community apps, education platforms, and
            30+ live products built with Next.js, React, and TypeScript.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.1}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-20 rounded-3xl border border-emerald-glow/25 bg-ink-soft/60 p-12 text-center">
            <h2 className="font-display text-3xl uppercase md:text-5xl">
              Have a project in mind?
            </h2>
            <GlassButton href="/contact" variant="accent" size="md" className="mt-8">
              Let&apos;s talk
            </GlassButton>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
