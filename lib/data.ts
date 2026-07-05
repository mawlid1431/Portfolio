import { cloudinaryUrl } from "./cloudinary";

export const SITE = {
  name: "Mowlid Haibe",
  alias: "Malitos",
  role: "Software Engineer & AI Innovator",
  tagline:
    "I help brands stand out in the digital world with stunning, user-friendly websites.",
  email: "malitmohamud@gmail.com",
  location: "Malaysia",
  available: true,
};

/** Upload these to Cloudinary under the devmalitos/ folder (or update the paths). */
export const IMAGES = {
  hero: cloudinaryUrl("devmalitos/hero"),
  working: cloudinaryUrl("devmalitos/working"),
  portrait: cloudinaryUrl("devmalitos/portrait"),
  flag: cloudinaryUrl("devmalitos/flag"),
  graduation: cloudinaryUrl("devmalitos/graduation"),
};

export const STATS = [
  { value: 30, suffix: "+", label: "Live projects in production" },
  { value: 3, suffix: "+", label: "Years of experience" },
  { value: 15, suffix: "+", label: "Happy clients" },
  { value: 5, suffix: "+", label: "Global hackathons" },
];

export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/mawlid1431" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mowlid-mohamoud-haibe-8b7b6a189/",
  },
  { label: "Twitter", href: "https://twitter.com/malitfx1" },
  { label: "Instagram", href: "https://instagram.com/malitfx" },
  { label: "YouTube", href: "https://www.youtube.com/@malitfx321" },
  { label: "Facebook", href: "https://fb.com/maamo.ugaaso" },
  {
    label: "Upwork",
    href: "https://www.upwork.com/freelancers/~0170d3d730409d6252",
  },
  { label: "Freelancer", href: "https://www.freelancer.com/u/Malithaibe" },
];

export const HIGHLIGHTS = [
  {
    icon: "🌍",
    title: "Global Perspective",
    text: "Originally from Somaliland, graduated from the rigorous ALX Software Engineering Program, and currently advancing my Bachelor of Computer Science in Malaysia.",
  },
  {
    icon: "💡",
    title: "Full-Lifecycle Execution",
    text: "Managing the entire software lifecycle — from database design and API integration to UI/UX execution and cloud deployment.",
  },
  {
    icon: "📱",
    title: "Mobile Development",
    text: "Building polished iOS mobile apps with React Native and Expo for fast, scalable cross-platform experiences.",
  },
  {
    icon: "🤖",
    title: "AI Integration",
    text: "Engineering highly scalable AI-driven applications, including CallBack AI (an autonomous career agent) and Pure CRM (intelligent job hunting).",
  },
  {
    icon: "🏆",
    title: "High-Pressure Problem Solving",
    text: "Veteran of 5+ global hackathons, including the Great AI Hackathon — rapidly prototyping and shipping AI solutions under strict deadlines.",
  },
  {
    icon: "⏱️",
    title: "Professional Excellence",
    text: "Known by teams and clients for being detail-oriented, a strict timekeeper, and a relentless continuous learner.",
  },
];

export const PILLARS = [
  {
    n: "01",
    title: "Web Application Development",
    text: "Scalable applications with React, Next.js, TypeScript and Node.js — from concept to deployment.",
  },
  {
    n: "02",
    title: "Mobile & iOS Development",
    text: "Polished iOS mobile apps built with React Native and Expo — fast, scalable, cross-platform.",
  },
  {
    n: "03",
    title: "AI-Driven Applications",
    text: "Intelligent systems like CallBack AI and Pure CRM — integrating OpenAI and Claude into real products.",
  },
  {
    n: "04",
    title: "Full-Stack Solutions & Design",
    text: "APIs, authentication, databases, payments and user-centered interfaces that hold up under real-world load.",
  },
];

export type Project = {
  slug: string;
  title: string;
  pitch: string;
  tag: string;
  year: number;
  imagePath: string;
  liveUrl?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
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
  },
  {
    slug: "hodogiire",
    title: "Hodogiire",
    pitch: "Digital platform connecting people with local opportunity.",
    tag: "Platform",
    year: 2023,
    imagePath: "devmalitos/projects/hodogiire",
  },
  {
    slug: "tamarsan-energy",
    title: "Tamarsan Energy",
    pitch: "Corporate site for a clean-energy company.",
    tag: "Corporate",
    year: 2023,
    imagePath: "devmalitos/projects/tamarsan-energy",
  },
  {
    slug: "nujuum-arts",
    title: "Nujuum Arts",
    pitch: "Creative arts platform showcasing artists and their work.",
    tag: "Creative Arts",
    year: 2022,
    imagePath: "devmalitos/projects/nujuum-arts",
  },
  {
    slug: "hargeisa-now",
    title: "HargeisaNow",
    pitch: "Event discovery & booking platform for the city of Hargeisa.",
    tag: "Events",
    year: 2022,
    imagePath: "devmalitos/projects/hargeisa-now",
  },
  {
    slug: "team-united-4-hope",
    title: "TeamUnited4Hope",
    pitch: "Nonprofit platform uniting volunteers around humanitarian causes.",
    tag: "Nonprofit",
    year: 2022,
    imagePath: "devmalitos/projects/team-united-4-hope",
  },
  {
    slug: "umrah-rejzer",
    title: "UmrahRejzer",
    pitch: "Travel platform for planning and booking Umrah journeys.",
    tag: "Travel",
    year: 2021,
    imagePath: "devmalitos/projects/umrah-rejzer",
  },
  {
    slug: "skydanubia",
    title: "SKYDANUBIA",
    pitch: "Modern brand experience built for a growing company.",
    tag: "Brand",
    year: 2021,
    imagePath: "devmalitos/projects/skydanubia",
  },
];

export const EXPERIENCE = [
  {
    role: "Software Engineer",
    org: "BuildSom",
    period: "September 2025 — Present",
    text: "Responsible for the full software development lifecycle — planning and designing software solutions, defining project scope, and leading implementation. I deliver scalable, reliable systems aligned with business objectives using React, Next.js, TypeScript and Node.js.",
  },
  {
    role: "Digital Media & Protocol Manager",
    org: "Africa Science Week",
    period: "2023 — 2025",
    text: "Led digital media coverage and protocol management across 11 African countries. Produced content, coordinated communications, and managed international collaborations for high-quality media coverage.",
  },
  {
    role: "Head of Communication & Trainer",
    org: "Mansa Musa Start School",
    period: "May 2025 — July 2025",
    text: "Designed and delivered entrepreneurship and fundraising training for youth. Developed curriculum, hosted workshops, and mentored 12+ young founders in business planning, digital skills and leadership.",
  },
  {
    role: "Community & Communication Manager",
    org: "BarkulanHub",
    period: "January 2023 — December 2025",
    text: "Managed community engagement and digital initiatives. Built and maintained the BarkulanHub website, coordinated events, and led strategies growing the startup and freelancer community.",
  },
];

export const EDUCATION = [
  {
    title: "Bachelor of Computer Science",
    org: "Albukhary International University, Malaysia",
    period: "Current",
    text: "Focused on software engineering and web technologies.",
  },
  {
    title: "IBM Full Stack Developer",
    org: "IBM Professional Certificate",
    period: "2025",
    text: "Advanced full-stack development with enterprise-level technologies and cloud computing.",
  },
  {
    title: "Google Project Management Certificate",
    org: "Google",
    period: "Dec 2023 — Aug 2024",
    text: "Project planning, agile methodologies, stakeholder management, risk assessment and leadership.",
  },
  {
    title: "Full Stack Web Developer",
    org: "FikrCamp",
    period: "2023 — 2024",
    text: "Comprehensive full-stack program covering modern web technologies and best practices.",
  },
  {
    title: "Software Engineering Graduate",
    org: "ALX Africa",
    period: "Completed",
    text: "Rigorous software engineering program.",
  },
  {
    title: "Digital School Graduate",
    org: "Hargabits Digital School",
    period: "Completed",
    text: "Digital skills and technology training.",
  },
];

export const TECH_STACK = [
  {
    group: "Frontend Engineering",
    items: ["TypeScript", "JavaScript", "React", "Next.js", "Vite", "Tailwind CSS"],
  },
  {
    group: "Mobile Development",
    items: ["React Native", "Expo", "iOS"],
  },
  {
    group: "Backend & API",
    items: ["Python", "Django", "Node.js", "Express.js"],
  },
  {
    group: "Databases & BaaS",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase"],
  },
  {
    group: "Auth & Modern Infrastructure",
    items: ["Convex", "Supabase", "Clerk"],
  },
  {
    group: "Payment Gateways",
    items: ["Stripe", "PayPal", "Billplz", "iPay88", "ToyyibPay"],
  },
  {
    group: "Cloud, AI & DevOps",
    items: ["AWS", "Git & GitHub", "OpenAI", "Claude AI", "GitHub Copilot"],
  },
  {
    group: "UI/UX Design",
    items: ["Figma", "Adobe Suite", "Google Stitch", "UI/UX Design"],
  },
  {
    group: "Agile & Project Management",
    items: ["Jira", "ClickUp", "Notion", "Asana", "Trello", "Slack"],
  },
];

export const SERVICES = [
  {
    tier: "Standard",
    price: "$100 – $500",
    title: "Website Design",
    features: [
      "Responsive design",
      "Up to 5 pages",
      "2 rounds of revisions",
      "Basic SEO optimization",
    ],
  },
  {
    tier: "Premium",
    price: "$600 – $1000",
    title: "Full Website Package",
    features: [
      "Everything in Standard",
      "Up to 10 pages",
      "Unlimited revisions",
      "Advanced SEO",
      "Performance optimization",
    ],
    highlight: true,
  },
  {
    tier: "Custom",
    price: "Let's talk",
    title: "Mobile Apps & AI Solutions",
    features: [
      "iOS apps with React Native & Expo",
      "AI-driven applications",
      "Payment integrations (Stripe, PayPal)",
      "Full-stack systems & APIs",
      "Scoped quote before we start",
    ],
  },
];

export type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
};

export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      "Mowlid built a clean and impactful website for our charity. The platform helps us communicate our mission effectively. His technical skills and dedication are outstanding.",
    author: "Salmaan",
    role: "Founder of Mubarak Charity",
  },
  {
    quote:
      "Professional, fast, and detail-oriented. The platform exceeded our expectations and helped us reach our community more effectively.",
    author: "Community Lead",
    role: "BarkulanHub",
  },
  {
    quote:
      "From concept to launch, the execution was flawless. Highly recommend for any organization needing a polished digital presence.",
    author: "Project Stakeholder",
    role: "Somalisk Studenter-organisation",
  },
  {
    quote:
      "Outstanding technical skills and dedication. Mowlid turned our vision into a product we're proud to show the world.",
    author: "Nonprofit Director",
    role: "TeamUnited4Hope",
  },
];

/** @deprecated Use TESTIMONIALS instead */
export const TESTIMONIAL = TESTIMONIALS[0];

export const FAQS = [
  {
    q: "What services do you offer?",
    a: "Web application development, full-stack solutions, UI/UX design, and digital platforms for education, nonprofits and community initiatives — from concept to deployment.",
  },
  {
    q: "How long does a typical project take?",
    a: "A standard website takes 1–2 weeks. Larger full-stack applications typically run 3–6 weeks depending on scope. You get a clear timeline before we start.",
  },
  {
    q: "Do I need to provide the content for my website?",
    a: "It helps, but it's not required. I can guide you through content structure and help write and organize copy that fits your brand.",
  },
  {
    q: "Will you help me update my website in the future?",
    a: "Yes — I offer ongoing support and maintenance so your site stays fast, secure and up to date as your needs grow.",
  },
  {
    q: "What if I'm not satisfied with the initial design?",
    a: "Every package includes revision rounds, and I work closely with you from the first draft so we course-correct early. Your vision leads the design.",
  },
];
