import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function POST() {
  const tokenHash = await getSessionTokenHash();
  if (tokenHash) {
    const client = getConvexClient();
    await client.mutation(api.auth.logout, { tokenHash });
  }

  // Overwrite with an expired, matching-attribute cookie so the __Host- cookie
  // is reliably cleared (a bare delete may omit Secure/Path and be ignored).
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
