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

    const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "").trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim();
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 500 },
      );
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

    // Sign only the params we send to Cloudinary (string values match FormData).
    // `invalidate` purges the CDN cache when overwriting an existing public_id,
    // so replaced media doesn't keep serving the stale cached file.
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
      overwrite: "true",
      invalidate: "true",
    };
    if (publicId) paramsToSign.public_id = publicId;

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      publicId: publicId ?? null,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error("Upload sign error:", error);
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
