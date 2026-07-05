export default function Loading() {
  return (
    <main className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink">
      <p className="font-display text-4xl tracking-wide md:text-6xl">
        MALITOS<span className="animate-pulse text-emerald-bright">.</span>
      </p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-cream-dim">
        Build a story for everyday
      </p>
      <div className="mt-8 h-px w-40 overflow-hidden bg-cream/10">
        <div className="loading-bar h-full w-1/2 bg-emerald-bright" />
      </div>
    </main>
  );
}
