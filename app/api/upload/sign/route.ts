import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export const runtime = "nodejs";

/**
 * Returns a signature so the browser can upload directly to Cloudinary,
 * bypassing Vercel's ~4.5 MB request body limit.
 */
export async function POST(request: Request) {
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

    const body = (await request.json()) as {
      folder?: string;
      publicId?: string;
    };

    const folder = (body.folder ?? "devmalitos").trim();
    if (!/^devmalitos(\/[a-z0-9_-]+)?$/i.test(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const publicId = body.publicId?.trim() || undefined;
    // A crafted public_id can contain `/` to escape the signed folder, or `..`
    // for traversal. Restrict to a safe single path segment.
    if (publicId && !/^[a-z0-9_-]{1,100}$/i.test(publicId)) {
      return NextResponse.json({ error: "Invalid public id" }, { status: 400 });
    }
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number | boolean> = {
      timestamp,
      folder,
      overwrite: true,
    };
    if (publicId) paramsToSign.public_id = publicId;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET ?? "",
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      publicId: publicId ?? null,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Upload sign error:", error);
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
