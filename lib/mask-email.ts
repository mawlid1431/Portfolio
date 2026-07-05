/** Mask email for safe UI display, e.g. `malitmohamud@gmail.com` → `ma••••••••@gmail.com` */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "•••••@•••••";

  if (local.length <= 2) {
    return `${local[0] ?? ""}•••@${domain}`;
  }

  const visible = local.slice(0, 2);
  const hidden = "•".repeat(Math.min(local.length - 2, 6));
  return `${visible}${hidden}@${domain}`;
}
