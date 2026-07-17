import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function GET() {
  const tokenHash = await getSessionTokenHash();
  if (!tokenHash) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  try {
    const client = getConvexClient();
    let admin;
    try {
      // Prefer mutation so lastActiveAt advances while the admin uses the UI.
      admin = await client.mutation(api.auth.touchAndMe, { tokenHash });
    } catch {
      // Fallback if Convex hasn't been deployed with touchAndMe yet.
      admin = await client.query(api.auth.me, { tokenHash });
    }

    if (!admin) {
      return NextResponse.json({ admin: null }, { status: 401 });
    }

    return NextResponse.json({ admin, tokenHash });
  } catch (error) {
    console.error("auth/me error:", error);
    return NextResponse.json({ admin: null }, { status: 401 });
  }
}
