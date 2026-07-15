/**
 * SEO keywords derived from projects, experience, skills, and services.
 * Used in metadata + visible on-page copy (not keyword stuffing).
 */

/** Personal brand — highest chance to rank */
export const brandKeywords = [
  "Mowlid Haibe",
  "Mowlid",
  "Malitos",
  "Devmalitos",
  "Mowlid Haibe portfolio",
  "Malitos developer",
  "Devmalitos portfolio",
] as const;

/** Trending tech + stack (2025–2026) */
export const techTrendKeywords = [
  "AI web application developer",
  "AI agent development",
  "OpenAI integration",
  "Claude AI integration",
  "Next.js developer",
  "React developer",
  "TypeScript developer",
  "React Native developer",
  "Expo mobile app developer",
  "Convex backend developer",
  "full-stack developer Malaysia",
  "freelance web developer",
  "Stripe payment integration",
  "Supabase developer",
  "Vercel deployment",
] as const;

/** From real project categories & clients */
export const projectKeywords = [
  "nonprofit website developer",
  "charity website design",
  "fintech web application",
  "invoice billing system",
  "travel agency website",
  "Umrah booking website",
  "community platform developer",
  "education platform development",
  "event booking platform",
  "student organization website",
  "corporate website developer",
  "startup MVP development",
  "CRM development",
  "intelligent job hunting app",
  "autonomous career agent",
  "CallBack AI",
  "Pure CRM",
  "Mubarak Charity website",
  "BuildSom developer",
  "SkyDanubia website",
] as const;

/** From work experience & education */
export const experienceKeywords = [
  "software engineer Malaysia",
  "Somaliland software engineer",
  "BuildSom software engineer",
  "Africa Science Week digital media",
  "BarkulanHub developer",
  "ALX Africa software engineering",
  "IBM full stack developer",
  "Google project management certificate",
  "FikrCamp full stack",
  "computer science Malaysia",
  "freelancer Upwork developer",
] as const;

/** Services you sell on the site */
export const serviceKeywords = [
  "custom website development",
  "portfolio website developer",
  "startup web development",
  "nonprofit web development",
  "mobile app development",
  "UI UX web design",
  "website maintenance support",
  "SEO optimized website",
  "performance optimization",
  "hire web developer",
] as const;

export const allSeoKeywords = [
  ...brandKeywords,
  ...techTrendKeywords,
  ...projectKeywords,
  ...experienceKeywords,
  ...serviceKeywords,
] as const;

/** Short labels for visible expertise chips on the homepage */
export const expertiseHighlights = [
  { label: "AI web apps & agents", href: "/projects" },
  { label: "Nonprofit & charity sites", href: "/projects/mubarak-charity" },
  { label: "Fintech & billing systems", href: "/projects/barkulan-fintech" },
  { label: "Travel & booking platforms", href: "/projects/skydanubia" },
  { label: "Next.js & React", href: "/projects" },
  { label: "React Native & Expo", href: "/about" },
  { label: "OpenAI & Claude integration", href: "/projects/callback-ai" },
  { label: "Community platforms", href: "/projects/somalisk-studenter" },
  { label: "Education platforms", href: "/projects/digital-empowerment-hub" },
  { label: "Full-stack Malaysia", href: "/about" },
] as const;

export const seoLongDescription =
  "Mowlid Haibe (Malitos · Devmalitos) builds AI web applications, nonprofit websites, fintech platforms, travel booking sites, and full-stack products with Next.js, React, TypeScript, React Native, Convex, OpenAI, and Stripe — based in Malaysia, serving startups and organizations worldwide.";

export const seoAboutDescription =
  "About Mowlid Haibe — ALX & IBM-trained full-stack engineer at BuildSom, former BarkulanHub & Africa Science Week lead. Expert in Next.js, AI agents, React Native, nonprofit web development, and community platforms.";

export const seoProjectsDescription =
  "Devmalitos project portfolio: CallBack AI, Pure CRM, Mubarak Charity, BuildSom, SkyDanubia, BarkulanFintech, Somalisk Studenter, and 30+ live web & mobile apps by Mowlid Haibe.";
