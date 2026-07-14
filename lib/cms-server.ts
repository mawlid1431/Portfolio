import { api, getConvexClient } from "./convex";

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

export async function fetchPublicExperiences(): Promise<PublicExperience[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.experiences.listPublic, {});
    return items.map((e) => ({
      role: e.role,
      org: e.org,
      period: e.period,
      text: e.text,
    }));
  } catch {
    return [];
  }
}

export async function fetchPublicEducation(): Promise<PublicEducation[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.educations.listPublic, {});
    return items.map((e) => ({
      title: e.title,
      org: e.org,
      period: e.period,
      text: e.text,
    }));
  } catch {
    return [];
  }
}

export async function fetchPublicSkills(): Promise<PublicSkillGroup[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.skills.listPublic, {});
    return items.map((s) => ({ group: s.group, items: s.items }));
  } catch {
    return [];
  }
}

export async function fetchPublicFaqs(): Promise<PublicFaq[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.faqs.listPublic, {});
    return items.map((f) => ({ q: f.question, a: f.answer }));
  } catch {
    return [];
  }
}

export async function fetchPublicSocials(): Promise<PublicSocial[]> {
  try {
    const client = getConvexClient();
    const items = await client.query(api.socialLinks.listPublic, {});
    return items.map((s) => ({ label: s.label, href: s.href }));
  } catch {
    return [];
  }
}
