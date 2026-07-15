import type { Metadata } from "next";
import { SITE } from "./data";
import {
  allSeoKeywords,
  seoAboutDescription,
  seoLongDescription,
  seoProjectsDescription,
} from "./seo-keywords";
import { PROFILE_URLS } from "./seo-structured-data";

export const defaultDescription = seoLongDescription;

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://malitos.tech"
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
  keywords: [...allSeoKeywords],
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

export { seoAboutDescription, seoLongDescription, seoProjectsDescription };

export function getStructuredData(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: SITE.name,
        alternateName: ["Mowlid", SITE.alias, "Devmalitos", "Mowlid Mohamoud Haibe"],
        jobTitle: SITE.role,
        email: SITE.email,
        url: siteUrl,
        sameAs: [...PROFILE_URLS],
        address: {
          "@type": "PostalAddress",
          addressCountry: SITE.location,
        },
        knowsAbout: [
          "AI web applications",
          "AI agent development",
          "OpenAI integration",
          "Claude AI integration",
          "Next.js",
          "React",
          "TypeScript",
          "React Native",
          "Expo",
          "Convex",
          "Nonprofit website development",
          "Charity website design",
          "Fintech web applications",
          "Travel booking platforms",
          "Community platforms",
          "Education platforms",
          "CRM development",
          "Stripe payment integration",
          "Full-stack web development",
          "Mobile app development",
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
          "AI web application development",
          "AI agent and CRM development",
          "Nonprofit and charity website design",
          "Fintech and billing system development",
          "Travel and booking platform development",
          "Community and education platform development",
          "Full-stack software engineering",
          "React Native mobile app development",
          "Portfolio and startup website design",
          "Website maintenance and SEO optimization",
        ],
      },
    ],
  };
}
