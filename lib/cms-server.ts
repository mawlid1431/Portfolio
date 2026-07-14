import { api, getConvexClient } from "./convex";
import { EDUCATION, EXPERIENCE, FAQS, SOCIALS, TECH_STACK } from "./data";

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

export type PublicEducation = {
  title: string;
  org: string;
  period: string;
  text: string;
};

export type PublicSkillGroup = {
  group: string;
  items: string[];
};

export async function fetchPublicEducation(): Promise<PublicEducation[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.educations.listPublic, {});
    if (items.length > 0) {
      return items.map((e) => ({
        title: e.title,
        org: e.org,
        period: e.period,
        text: e.text,
      }));
    }
  } catch {
    // fall through
  }
  return EDUCATION;
}

export async function fetchPublicSkills(): Promise<PublicSkillGroup[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.skills.listPublic, {});
    if (items.length > 0) {
      return items.map((s) => ({ group: s.group, items: s.items }));
    }
  } catch {
    // fall through
  }
  return TECH_STACK;
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
