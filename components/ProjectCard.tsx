import Link from "next/link";
import Portrait from "./Portrait";
import { projectImageUrl, type PublicProject } from "@/lib/projects";

export default function ProjectCard({
  project,
  delay = 0,
}: {
  project: PublicProject;
  delay?: number;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="work-card group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl border border-emerald-glow/20 bg-ink-soft/80 backdrop-blur"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <div className="relative h-40 overflow-hidden">
        <Portrait
          src={projectImageUrl(project.imagePath, 800)}
          alt={project.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cream-dim backdrop-blur">
          {project.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-bright">
              {project.tag}
            </span>
            {project.featured && (
              <span className="rounded-full bg-emerald-glow/15 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-emerald-bright">
                Featured
              </span>
            )}
          </div>
          <h2 className="font-display mt-3 text-2xl uppercase leading-tight">
            {project.title}
          </h2>
        </div>
        <div>
          <p className="line-clamp-2 text-sm text-cream-dim">{project.pitch}</p>
          <span className="mt-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-bright opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
