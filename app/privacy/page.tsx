import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy — Mowlid Haibe" };

export default function PrivacyPage() {
  return (
    <main className="pt-28">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-5xl uppercase md:text-7xl">
          Privacy <span className="text-emerald-bright">Policy</span>
        </h1>
        <div className="mt-10 flex flex-col gap-6 text-sm leading-relaxed text-cream-dim">
          <p>
            This website does not collect personal data beyond what you choose
            to share when contacting me by email or through the contact form.
          </p>
          <p>
            Information you send (name, email, project details) is used only to
            respond to your inquiry and is never sold or shared with third
            parties.
          </p>
          <p>
            Questions? Reach out at{" "}
            <a
              href="mailto:malitmohamud@gmail.com"
              className="text-emerald-bright underline"
            >
              malitmohamud@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
