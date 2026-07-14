import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export const PASSWORD_CHECK_UNAVAILABLE =
  "Couldn't verify password safety right now. Please try again in a moment.";

/** Fails CLOSED: throws if the breach check can't complete, so a breached
 * password is never silently accepted during an HIBP outage. */
export async function isPasswordLeaked(password: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  let body: string;
  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } },
    );
    if (!response.ok) throw new Error(PASSWORD_CHECK_UNAVAILABLE);
    body = await response.text();
  } catch (error) {
    if (error instanceof Error && error.message === PASSWORD_CHECK_UNAVAILABLE) {
      throw error;
    }
    throw new Error(PASSWORD_CHECK_UNAVAILABLE);
  }
  return body.split("\n").some((line) => line.startsWith(`${suffix}:`));
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 200) {
    return "Password must be at most 200 characters.";
  }
  return null;
}
