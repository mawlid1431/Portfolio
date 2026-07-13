import type { ComponentType, SVGProps } from "react";
import {
  IconSquares,
  IconFolder,
  IconPhoto,
  IconBriefcase,
  IconEnvelope,
  IconQuestion,
  IconLink,
  IconDocument,
  IconCog,
} from "@/components/admin/AdminIcons";

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

export type AdminNavItem = {
  key: AdminTab;
  label: string;
  description: string;
  section: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Stats & recent activity",
    section: "General",
    icon: IconSquares,
  },
  {
    key: "projects",
    label: "Projects",
    description: "Portfolio case studies",
    section: "Content",
    icon: IconFolder,
  },
  {
    key: "images",
    label: "Images",
    description: "Site imagery",
    section: "Content",
    icon: IconPhoto,
  },
  {
    key: "experience",
    label: "Experience",
    description: "Work history",
    section: "Content",
    icon: IconBriefcase,
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Common questions",
    section: "Content",
    icon: IconQuestion,
  },
  {
    key: "messages",
    label: "Messages",
    description: "Contact inbox",
    section: "Inbox",
    icon: IconEnvelope,
  },
  {
    key: "socials",
    label: "Socials",
    description: "Profile links",
    section: "Profile",
    icon: IconLink,
  },
  {
    key: "cv",
    label: "CV",
    description: "Resume document",
    section: "Profile",
    icon: IconDocument,
  },
  {
    key: "settings",
    label: "Settings",
    description: "Account & security",
    section: "Profile",
    icon: IconCog,
  },
];

export function isAdminNavSectionStart(index: number) {
  if (index === 0) return true;
  return ADMIN_NAV[index].section !== ADMIN_NAV[index - 1].section;
}
