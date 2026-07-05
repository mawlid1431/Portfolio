import { cookies } from "next/headers";
import { SESSION_COOKIE, hashValue } from "@/lib/auth";

export async function getSessionTokenHash(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return hashValue(token);
}

export async function getRawSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
