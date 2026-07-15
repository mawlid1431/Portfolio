import type { Metadata } from "next";
import { SITE } from "./data";

const defaultDescription =
  "Full-stack software engineer building scalable web applications for startups, nonprofits, and community-driven organizations.";

const seoKeywords = [
  "Mowlid Haibe",
  "Mowlid",
  "Malitos",
  "Devmalitos",
  "Mowlid portfolio",
  "Mowlid Haibe portfolio",
  "Malitos developer",
  "Devmalitos portfolio",
  "software engineer Malaysia",
  "Somaliland software engineer",
  "full-stack developer",
  "web developer",
  "AI innovator",
  "Next.js developer",
  "React developer",
  "portfolio website developer",
  "startup web development",
  "nonprofit web development",
  "custom website development",
];

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://malitos.dev"
    : "http://localhost:3000";
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.name}`,
  },
  description: defaultDescription,
  applicationName: SITE.alias,
  authors: [{ name: SITE.name, url: getSiteUrl() }],
  creator: SITE.name,
  publisher: SITE.alias,
  keywords: seoKeywords,
  alternates: {
    canonical: "/",
  },
  category: "technology",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.alias,
    url: "/",
    title: `${SITE.name} — ${SITE.role}`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary",
    title: `${SITE.name} — ${SITE.role}`,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export function getStructuredData(): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: SITE.name,
        alternateName: ["Mowlid", SITE.alias, "Devmalitos"],
        jobTitle: SITE.role,
        email: SITE.email,
        url: siteUrl,
        address: {
          "@type": "PostalAddress",
          addressCountry: SITE.location,
        },
        knowsAbout: [
          "Full-stack web development",
          "AI integration",
          "Next.js",
          "React",
          "TypeScript",
          "Portfolio websites",
          "Startup websites",
          "Nonprofit websites",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE.alias,
        alternateName: ["Devmalitos", "Mowlid Haibe Portfolio"],
        url: siteUrl,
        description: defaultDescription,
        inLanguage: "en",
        publisher: {
          "@id": `${siteUrl}/#person`,
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#service`,
        name: "Devmalitos",
        url: siteUrl,
        founder: {
          "@id": `${siteUrl}/#person`,
        },
        areaServed: "Worldwide",
        serviceType: [
          "Web development",
          "Full-stack software engineering",
          "AI application development",
          "Portfolio website design",
        ],
      },
    ],
  };
}
