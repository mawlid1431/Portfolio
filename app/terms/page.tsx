import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="pt-28">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-5xl uppercase md:text-7xl">
          Terms of <span className="text-emerald-bright">Service</span>
        </h1>
        <div className="mt-10 flex flex-col gap-6 text-sm leading-relaxed text-cream-dim">
          <p>
            All client work is delivered under a standard freelance agreement:
            you own the final deliverables once the project is paid in full.
          </p>
          <p>
            Each service package includes the revision rounds listed on the
            services section. Additional revisions or scope changes are quoted
            separately before any work begins.
          </p>
          <p>
            Portfolio pieces shown on this site remain the property of their
            respective owners and are displayed with permission.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
