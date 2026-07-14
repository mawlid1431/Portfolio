/**
 * Normalize a user-supplied URL to a safe http(s) absolute URL, or undefined.
 * Rejects `javascript:`, `data:`, and other schemes that become stored XSS
 * when rendered into an <a href>. Throws on a non-empty but invalid value so
 * the admin gets clear feedback rather than silently storing something unsafe.
 */
export function sanitizeHttpUrl(input: string | undefined): string | undefined {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Enter a valid URL starting with https://");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("URL must start with http:// or https://");
  }
  return parsed.toString();
}

/**
 * Sanitize a link for a social/contact link — allows http(s), plus mailto: and
 * tel:. Still blocks javascript:/data: and other XSS-capable schemes.
 */
export function sanitizeLinkHref(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Link is required");

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Enter a valid link (https://, mailto:, or tel:)");
  }

  const allowed = ["https:", "http:", "mailto:", "tel:"];
  if (!allowed.includes(parsed.protocol)) {
    throw new Error("Link must be an https, mailto, or tel URL");
  }
  return parsed.toString();
}
