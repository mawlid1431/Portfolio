import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import GlassButton from "@/components/GlassButton";
import Portrait from "@/components/Portrait";
import Reveal from "@/components/Reveal";
import { fetchPublicProjects, fetchProjectBySlug } from "@/lib/projects-server";
import { projectImageUrl, STATIC_PROJECTS } from "@/lib/projects";

export async function generateStaticParams() {
  const projects = await fetchPublicProjects();
  const slugs = new Set(projects.map((p) => p.slug));
  for (const p of STATIC_PROJECTS) slugs.add(p.slug);
  return [...slugs].map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProjectBySlug(slug);
  if (!data) return { title: "Project not found" };

  return {
    title: `${data.project.title} — Mowlid Haibe`,
    description: data.project.pitch,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchProjectBySlug(slug);

  if (!data) notFound();

  const { project, nextSlug, prevSlug } = data;

  return (
    <main className="pt-28">
      <article className="mx-auto max-w-5xl px-6 py-12">
        <Reveal>
          <Link
            href="/projects"
            className="text-xs uppercase tracking-[0.3em] text-cream-dim transition-colors hover:text-emerald-bright"
          >
            ← All projects
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-glow/20">
            <Portrait
              src={projectImageUrl(project.imagePath, 1400)}
              alt={project.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="rounded-full border border-cream/15 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cream-dim">
              {project.year}
            </span>
            {project.tag && (
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
                {project.tag}
              </span>
            )}
            {project.featured && (
              <span className="rounded-full bg-emerald-glow/15 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-emerald-bright">
                Featured
              </span>
            )}
          </div>

          <h1 className="font-display mt-6 text-5xl uppercase leading-none md:text-7xl">
            {project.title}
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-cream-dim md:text-lg">
            {project.pitch}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {project.liveUrl ? (
              <GlassButton
                href={project.liveUrl}
                external
                variant="accent"
                size="md"
              >
                View live site ↗
              </GlassButton>
            ) : (
              <span className="glass-btn glass-btn-ghost glass-btn-md pointer-events-none opacity-70">
                <span className="glass-btn-label">Live link coming soon</span>
              </span>
            )}

            <GlassButton href="/contact" variant="ghost" size="md">
              Start a similar project
            </GlassButton>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <nav className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            {prevSlug ? (
              <Link
                href={`/projects/${prevSlug}`}
                className="text-sm uppercase tracking-[0.2em] text-cream-dim transition-colors hover:text-emerald-bright"
              >
                ← Previous project
              </Link>
            ) : (
              <span />
            )}

            {nextSlug ? (
              <GlassButton
                href={`/projects/${nextSlug}`}
                variant="ghost"
                size="md"
                className="sm:ml-auto"
              >
                Next project →
              </GlassButton>
            ) : (
              <GlassButton
                href="/projects"
                variant="ghost"
                size="sm"
                className="sm:ml-auto"
              >
                Back to all projects
              </GlassButton>
            )}
          </nav>
        </Reveal>
      </article>

      <Footer />
    </main>
  );
}
