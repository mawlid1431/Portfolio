import type { Metadata } from "next";
import { SITE } from "./data";

const defaultDescription =
  "Full-stack software engineer building scalable web applications for startups, nonprofits, and community-driven organizations.";

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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE.alias,
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
};
