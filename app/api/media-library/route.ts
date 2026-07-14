import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";
import { listCloudinaryAssets } from "@/lib/cloudinary-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const tokenHash = await getSessionTokenHash();
    if (!tokenHash) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = getConvexClient();
    const session = await client.query(api.auth.me, { tokenHash });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "video" ? "video" : "image";

    const assets = await listCloudinaryAssets(type);
    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Media library error:", error);
    return NextResponse.json(
      { error: "Failed to load media library" },
      { status: 500 },
    );
  }
}
