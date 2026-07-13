export type AdminTab =
  | "overview"
  | "projects"
  | "images"
  | "experience"
  | "messages"
  | "faq"
  | "socials"
  | "cv"
  | "settings";

export const ADMIN_NAV: { key: AdminTab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "projects", label: "Projects", icon: "◈" },
  { key: "images", label: "Images", icon: "🖼" },
  { key: "experience", label: "Experience", icon: "◎" },
  { key: "messages", label: "Messages", icon: "✉" },
  { key: "faq", label: "FAQ", icon: "?" },
  { key: "socials", label: "Socials", icon: "↗" },
  { key: "cv", label: "CV", icon: "▤" },
  { key: "settings", label: "Settings", icon: "⚙" },
];
