import { NextResponse } from "next/server";
import { createIdempotencyKey } from "@/lib/idempotency";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function GET() {
  const tokenHash = await getSessionTokenHash();
  if (!tokenHash) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const client = getConvexClient();
  const projects = await client.query(api.projects.list, { tokenHash });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const tokenHash = await getSessionTokenHash();
    if (!tokenHash) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      title?: string;
      pitch?: string;
      year?: number;
      imagePath?: string;
      liveUrl?: string;
      idempotencyKey?: string;
    };

    if (!body.title?.trim() || !body.pitch?.trim() || !body.imagePath?.trim()) {
      return NextResponse.json(
        { error: "Title, description, and image are required." },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const projectId = await client.mutation(api.projects.create, {
      tokenHash,
      title: body.title,
      pitch: body.pitch,
      year: body.year ?? new Date().getFullYear(),
      imagePath: body.imagePath.trim(),
      liveUrl: body.liveUrl?.trim() || undefined,
      idempotencyKey: body.idempotencyKey ?? createIdempotencyKey("project"),
    });

    return NextResponse.json({ ok: true, projectId });
  } catch (error) {
    console.error("Create-project error:", error);
    const raw = error instanceof Error ? error.message : "";
    // Surface validation feedback (e.g. URL scheme), hide internal errors.
    const safe = /required|URL|http|Unauthorized/i.test(raw)
      ? raw
      : "Failed to create project.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
