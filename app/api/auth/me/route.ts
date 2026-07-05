import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function GET() {
  const tokenHash = await getSessionTokenHash();
  if (!tokenHash) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  const client = getConvexClient();
  const admin = await client.query(api.auth.me, { tokenHash });

  if (!admin) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  return NextResponse.json({ admin, tokenHash });
}
