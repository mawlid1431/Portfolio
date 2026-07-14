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

