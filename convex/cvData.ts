/**
 * CV content extracted from Mowlid Mohamoud Haibe's CV (LinkedIn export).
 * Holds work experience, education, and skills.
 * Seeded into the database by `seedCv.ts` (run: npx convex run seedCv:run).
 */

export const CV_EXPERIENCES: Array<{
  role: string;
  org: string;
  period: string;
  text: string;
}> = [
  {
    role: "Software Engineer",
    org: "BuildSom",
    period: "Sep 2025 — Present · Denmark",
    text: "Developing modern web applications and digital platforms for startups and growing businesses using React, Next.js, TypeScript, and Node.js. Designing responsive UIs with Tailwind CSS, building backend services, APIs, and database integrations, collaborating on product architecture, and deploying and optimizing applications for performance and scalability.",
  },
  {
    role: "Communication & Community Manager",
    org: "Barkulan Coworking and Innovation Hub",
    period: "Feb 2023 — Mar 2026 · Hargeisa, Somaliland",
    text: "Supported community members in building their futures through work, business, and other engagements. Connected curated sub-communities around tech, innovation, personal development, and media, and organized events to keep the communities alive, cohesive, and thriving.",
  },
  {
    role: "Chief Marketing Officer",
    org: "NexLogik",
    period: "Oct 2024 — Jan 2025 · Hargeisa, Somaliland",
    text: "Led social media management and marketing strategy: developed and executed campaigns to grow NexLogik's brand and online presence, analyzed market trends and audience insights, and collaborated with the team to support business growth through effective marketing and communications.",
  },
  {
    role: "Online Community Manager",
    org: "Next Einstein Forum (NEF)",
    period: "Nov 2024 · Hargeisa, Somaliland",
    text: "Contract-based freelance Media Communication Designer for the NEF SDG Week project, highlighting youth and tech initiatives to showcase impactful solutions.",
  },
  {
    role: "Product Service Coordinator",
    org: "Somaliland STEM Society Institute",
    period: "Jun 2023 · Hargeisa, Somaliland",
    text: "Supported a professional STEM community through workshops, seminars, research projects, and networking opportunities, engaging with local businesses, educational institutions, and government agencies to address the needs of the STEM sector in Somaliland.",
  },
  {
    role: "Frontend Developer",
    org: "SomDigital Solutions",
    period: "Dec 2022 — Mar 2023 · Hargeisa, Somaliland",
    text: "Built user interfaces with a team combining design, development, UI/UX, and digital marketing.",
  },
  {
    role: "Graphic Designer (UI/UX)",
    org: "Som_host Design and Development",
    period: "Nov 2022 — Jan 2023 · Hargeisa, Somaliland",
    text: "Founded and led a small design and development studio as CEO, successfully delivering many projects across design, development, and digital marketing.",
  },
  {
    role: "Front End Assistant",
    org: "Somtel",
    period: "Nov 2022 — Dec 2022 · Hargeisa, Somaliland",
    text: "Front-end assistance at one of the largest internet and telecom providers in the region.",
  },
  {
    role: "Marketing Assistant",
    org: "Hargeisa Information Technology",
    period: "Mar 2019 — Mar 2023 · Hargeisa, Somaliland",
    text: "Supported marketing operations over a four-year contract until its successful completion.",
  },
  {
    role: "Captain Waiter",
    org: "Mocha Coffee",
    period: "Jul 2021 — Sep 2022 · Hargeisa, Somaliland",
    text: "Led front-of-house service at a beverage and coffee company.",
  },
  {
    role: "Sales & Marketing Specialist",
    org: "Clothes and Accessories MAF 2013 SL",
    period: "Jun 2019 — Jun 2021 · Hargeisa, Somaliland",
    text: "Head of marketing and sales for the company before transitioning my career toward technology.",
  },
];

export const CV_EDUCATIONS: Array<{
  title: string;
  org: string;
  period: string;
  text: string;
}> = [
  {
    title: "Bachelor of Computer Science",
    org: "Albukhary International University",
    period: "Oct 2024 — Oct 2027",
    text: "Bachelor's degree in Computer Science, currently in progress in Alor Setar, Malaysia.",
  },
  {
    title: "Bootcamp — Web & Digital Multimedia Design",
    org: "Hargabits",
    period: "Oct 2022 — Feb 2023",
    text: "Intensive bootcamp covering web page design, digital/multimedia, and information resources design.",
  },
  {
    title: "Higher National Diploma — Programming",
    org: "Hargabits / Shaqo Doon Org",
    period: "Jan 2022 — Jan 2023",
    text: "Higher National Diploma in computer games and programming skills.",
  },
  {
    title: "BTech, Telecommunications Engineering",
    org: "Tima Ade University",
    period: "2019 — 2023",
    text: "Bachelor of Technology in Telecommunications Engineering.",
  },
  {
    title: "Certificate — Cinematography & Film/Video Production",
    org: "Udemy",
    period: "Jan 2019 — Nov 2019",
    text: "Certificate in cinematography and film/video production.",
  },
];

export const CV_FAQS: Array<{
  question: string;
  answer: string;
}> = [
  {
    question: "What services do you offer?",
    answer:
      "Web application development, full-stack solutions, UI/UX design, and digital platforms for education, nonprofits and community initiatives — from concept to deployment.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A standard website takes 1–2 weeks. Larger full-stack applications typically run 3–6 weeks depending on scope. You get a clear timeline before we start.",
  },
  {
    question: "Do I need to provide the content for my website?",
    answer:
      "It helps, but it's not required. I can guide you through content structure and help write and organize copy that fits your brand.",
  },
  {
    question: "Will you help me update my website in the future?",
    answer:
      "Yes — I offer ongoing support and maintenance so your site stays fast, secure and up to date as your needs grow.",
  },
  {
    question: "What if I'm not satisfied with the initial design?",
    answer:
      "Every package includes revision rounds, and I work closely with you from the first draft so we course-correct early. Your vision leads the design.",
  },
];

export const CV_SKILL_GROUPS: Array<{
  group: string;
  items: string[];
}> = [
  {
    group: "Frontend",
    items: ["React.js", "Next.js", "TypeScript", "Vue.js", "Tailwind CSS"],
  },
  {
    group: "Backend & Full-Stack",
    items: ["Node.js", "REST APIs", "Database Integrations", "Full-Stack Development", "Convex"],
  },
  {
    group: "Design & Marketing",
    items: ["UI/UX Design", "Graphic Design", "Digital Marketing", "WordPress", "Social Media Management"],
  },
  {
    group: "Leadership & Management",
    items: ["Project Management", "Community Building", "Storytelling & Communication", "Event Management"],
  },
  {
    group: "Languages",
    items: ["English (Full Professional)", "Arabic (Full Professional)", "Malay (Elementary)"],
  },
];
