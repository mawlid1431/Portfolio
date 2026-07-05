import { cn } from "./cn";

export type GlassButtonVariant = "primary" | "ghost" | "danger" | "accent";
export type GlassButtonSize = "sm" | "md" | "lg" | "icon";

export function glassButtonClasses({
  variant = "primary",
  size = "md",
}: {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
} = {}): string {
  return cn(
    "glass-btn",
    variant === "primary" && "glass-btn-primary",
    variant === "ghost" && "glass-btn-ghost",
    variant === "danger" && "glass-btn-danger",
    variant === "accent" && "glass-btn-accent",
    size === "sm" && "glass-btn-sm",
    size === "md" && "glass-btn-md",
    size === "lg" && "glass-btn-lg",
    size === "icon" && "glass-btn-icon",
  );
}
