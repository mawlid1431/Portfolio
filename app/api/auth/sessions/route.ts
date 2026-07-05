import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function GET() {
  const tokenHash = await getSessionTokenHash();
  if (!tokenHash) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = getConvexClient();
  const sessions = await client.query(api.auth.listSessions, { tokenHash });
  return NextResponse.json({ sessions });
}

export async function DELETE(request: Request) {
  try {
    const tokenHash = await getSessionTokenHash();
    if (!tokenHash) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as { sessionId?: string };
    if (!body.sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const client = getConvexClient();
    await client.mutation(api.auth.revokeSession, {
      tokenHash,
      sessionId: body.sessionId as import("@/convex/_generated/dataModel").Id<"sessions">,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revoke session";

    if (message === "CURRENT_SESSION_REVOKED") {
      return NextResponse.json({ ok: true, loggedOut: true });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
