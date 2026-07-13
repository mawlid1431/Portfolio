/** Default CMS content — kept in sync with lib/data.ts */

export const defaultProjects = [
  {
    slug: "callback-ai",
    title: "CallBack AI",
    pitch:
      "An autonomous career agent — AI that follows up, schedules and advances your job search on its own.",
    tag: "AI Application",
    year: 2025,
    imagePath: "devmalitos/projects/callback-ai",
    featured: true,
  },
  {
    slug: "pure-crm",
    title: "Pure CRM",
    pitch:
      "Intelligent job-hunting CRM that tracks applications and surfaces the next best action with AI.",
    tag: "AI Application",
    year: 2025,
    imagePath: "devmalitos/projects/pure-crm",
    featured: false,
  },
  {
    slug: "somalisk-studenter",
    title: "Somalisk Studenter-organisation",
    pitch:
      "Community & student platform connecting Somali students across Scandinavia.",
    tag: "Community Platform",
    year: 2024,
    imagePath: "devmalitos/projects/somalisk-studenter",
    featured: true,
  },
  {
    slug: "barkulan-fintech",
    title: "BarkulanFintech",
    pitch: "Invoice & billing management system built for growing businesses.",
    tag: "Fintech",
    year: 2024,
    imagePath: "devmalitos/projects/barkulan-fintech",
    featured: true,
  },
  {
    slug: "mubarak-charity",
    title: "Mubarak Charity",
    pitch:
      "A clean, impactful platform helping a charity communicate its mission.",
    tag: "Nonprofit",
    year: 2024,
    imagePath: "devmalitos/projects/mubarak-charity",
    liveUrl: "https://mubarakcharity.org",
    featured: true,
  },
  {
    slug: "digital-empowerment-hub",
    title: "Digital Empowerment Hub",
    pitch: "Education platform empowering communities with digital skills.",
    tag: "Education",
    year: 2023,
    imagePath: "devmalitos/projects/digital-empowerment-hub",
    featured: false,
  },
  {
    slug: "hodogiire",
    title: "Hodogiire",
    pitch: "Digital platform connecting people with local opportunity.",
    tag: "Platform",
    year: 2023,
    imagePath: "devmalitos/projects/hodogiire",
    featured: false,
  },
  {
    slug: "tamarsan-energy",
    title: "Tamarsan Energy",
    pitch: "Corporate site for a clean-energy company.",
    tag: "Corporate",
    year: 2023,
    imagePath: "devmalitos/projects/tamarsan-energy",
    featured: false,
  },
  {
    slug: "nujuum-arts",
    title: "Nujuum Arts",
    pitch: "Creative arts platform showcasing artists and their work.",
    tag: "Creative Arts",
    year: 2022,
    imagePath: "devmalitos/projects/nujuum-arts",
    featured: false,
  },
  {
    slug: "hargeisa-now",
    title: "HargeisaNow",
    pitch: "Event discovery & booking platform for the city of Hargeisa.",
    tag: "Events",
    year: 2022,
    imagePath: "devmalitos/projects/hargeisa-now",
    featured: false,
  },
  {
    slug: "team-united-4-hope",
    title: "TeamUnited4Hope",
    pitch: "Nonprofit platform uniting volunteers around humanitarian causes.",
    tag: "Nonprofit",
    year: 2022,
    imagePath: "devmalitos/projects/team-united-4-hope",
    featured: false,
  },
  {
    slug: "umrah-rejzer",
    title: "UmrahRejzer",
    pitch: "Travel platform for planning and booking Umrah journeys.",
    tag: "Travel",
    year: 2021,
    imagePath: "devmalitos/projects/umrah-rejzer",
    featured: false,
  },
  {
    slug: "skydanubia",
    title: "SKYDANUBIA",
    pitch: "Modern brand experience built for a growing company.",
    tag: "Brand",
    year: 2021,
    imagePath: "devmalitos/projects/skydanubia",
    featured: false,
  },
] as const;

export const defaultImages = [
  { key: "hero", label: "Hero", cloudinaryPath: "devmalitos/hero" },
  { key: "working", label: "Working", cloudinaryPath: "devmalitos/working" },
  { key: "portrait", label: "Portrait", cloudinaryPath: "devmalitos/portrait" },
  { key: "flag", label: "Flag", cloudinaryPath: "devmalitos/flag" },
  {
    key: "graduation",
    label: "Graduation",
    cloudinaryPath: "devmalitos/graduation",
  },
  {
    key: "about-showreel",
    label: "About showreel",
    cloudinaryPath: "devmalitos/about-showreel",
  },
] as const;

export const defaultExperience = [
  {
    role: "Software Engineer",
    org: "BuildSom",
    period: "September 2025 — Present",
    text: "Responsible for the full software development lifecycle — planning and designing software solutions, defining project scope, and leading implementation. I deliver scalable, reliable systems aligned with business objectives using React, Next.js, TypeScript and Node.js.",
    sortOrder: 0,
  },
  {
    role: "Digital Media & Protocol Manager",
    org: "Africa Science Week",
    period: "2023 — 2025",
    text: "Led digital media coverage and protocol management across 11 African countries. Produced content, coordinated communications, and managed international collaborations for high-quality media coverage.",
    sortOrder: 1,
  },
  {
    role: "Head of Communication & Trainer",
    org: "Mansa Musa Start School",
    period: "May 2025 — July 2025",
    text: "Designed and delivered entrepreneurship and fundraising training for youth. Developed curriculum, hosted workshops, and mentored 12+ young founders in business planning, digital skills and leadership.",
    sortOrder: 2,
  },
  {
    role: "Community & Communication Manager",
    org: "BarkulanHub",
    period: "January 2023 — December 2025",
    text: "Managed community engagement and digital initiatives. Built and maintained the BarkulanHub website, coordinated events, and led strategies growing the startup and freelancer community.",
    sortOrder: 3,
  },
] as const;

export const defaultFaqs = [
  {
    question: "What services do you offer?",
    answer:
      "Web application development, full-stack solutions, UI/UX design, and digital platforms for education, nonprofits and community initiatives — from concept to deployment.",
    sortOrder: 0,
  },
  {
    question: "How long does a typical project take?",
    answer:
      "A standard website takes 1–2 weeks. Larger full-stack applications typically run 3–6 weeks depending on scope. You get a clear timeline before we start.",
    sortOrder: 1,
  },
  {
    question: "Do I need to provide the content for my website?",
    answer:
      "It helps, but it's not required. I can guide you through content structure and help write and organize copy that fits your brand.",
    sortOrder: 2,
  },
  {
    question: "Will you help me update my website in the future?",
    answer:
      "Yes — I offer ongoing support and maintenance so your site stays fast, secure and up to date as your needs grow.",
    sortOrder: 3,
  },
  {
    question: "What if I'm not satisfied with the initial design?",
    answer:
      "Every package includes revision rounds, and I work closely with you from the first draft so we course-correct early. Your vision leads the design.",
    sortOrder: 4,
  },
] as const;

export const defaultSocials = [
  { label: "GitHub", href: "https://github.com/mawlid1431", sortOrder: 0 },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mowlid-mohamoud-haibe-8b7b6a189/",
    sortOrder: 1,
  },
  { label: "Twitter", href: "https://twitter.com/malitfx1", sortOrder: 2 },
  { label: "Instagram", href: "https://instagram.com/malitfx", sortOrder: 3 },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@malitfx321",
    sortOrder: 4,
  },
  { label: "Facebook", href: "https://fb.com/maamo.ugaaso", sortOrder: 5 },
  {
    label: "Upwork",
    href: "https://www.upwork.com/freelancers/~0170d3d730409d6252",
    sortOrder: 6,
  },
  {
    label: "Freelancer",
    href: "https://www.freelancer.com/u/Malithaibe",
    sortOrder: 7,
  },
] as const;
