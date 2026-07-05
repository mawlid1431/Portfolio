import { api, getConvexClient } from "./convex";
import { EXPERIENCE, FAQS, SOCIALS } from "./data";

export type PublicExperience = {
  role: string;
  org: string;
  period: string;
  text: string;
};

export type PublicFaq = {
  q: string;
  a: string;
};

export type PublicSocial = {
  label: string;
  href: string;
};

export async function fetchPublicExperiences(): Promise<PublicExperience[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.experiences.listPublic, {});
    if (items.length > 0) {
      return items.map((e) => ({
        role: e.role,
        org: e.org,
        period: e.period,
        text: e.text,
      }));
    }
  } catch {
    // fall through
  }
  return EXPERIENCE;
}

export async function fetchPublicFaqs(): Promise<PublicFaq[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.faqs.listPublic, {});
    if (items.length > 0) {
      return items.map((f) => ({ q: f.question, a: f.answer }));
    }
  } catch {
    // fall through
  }
  return FAQS;
}

export async function fetchPublicSocials(): Promise<PublicSocial[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.socialLinks.listPublic, {});
    if (items.length > 0) {
      return items.map((s) => ({ label: s.label, href: s.href }));
    }
  } catch {
    // fall through
  }
  return SOCIALS;
}
