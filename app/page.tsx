import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Pillars from "@/components/Pillars";
import Work from "@/components/Work";
import Services from "@/components/Services";
import Testimonial from "@/components/Testimonial";
import Faq from "@/components/Faq";
import Finale from "@/components/Finale";
import Footer from "@/components/Footer";
import { fetchSiteImageMap, resolveSiteImage } from "@/lib/images-server";
import { fetchPublicFaqs } from "@/lib/cms-server";
import { fetchPublicProjects } from "@/lib/projects-server";

export const revalidate = 60;

export default async function Home() {
  const [images, projects, faqs] = await Promise.all([
    fetchSiteImageMap(),
    fetchPublicProjects(),
    fetchPublicFaqs(),
  ]);

  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <main>
      <Hero heroSrc={resolveSiteImage(images, "hero", 1400)} />
      <Stats />
      <Pillars workingSrc={resolveSiteImage(images, "working", 1400)} />
      <Work
        featured={featured}
        portraitSrc={resolveSiteImage(images, "portrait", 1200)}
      />
      <Services />
      <Testimonial />
      <Faq items={faqs} />
      <Finale />
      <Footer />
    </main>
  );
}
