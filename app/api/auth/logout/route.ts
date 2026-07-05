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

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
