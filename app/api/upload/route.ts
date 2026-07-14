import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";
import { destroyCloudinaryAsset, uploadToCloudinary } from "@/lib/cloudinary-server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

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

    const form = await request.formData();
    const folder = String(form.get("folder") ?? "devmalitos").trim();
    const publicId = String(form.get("publicId") ?? "").trim() || undefined;
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = VIDEO_TYPES.has(file.type);
    const isImage = IMAGE_TYPES.has(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Only JPEG, PNG, WebP, GIF images or MP4/WebM/MOV videos are allowed",
        },
        { status: 400 },
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video must be smaller than 50 MB"
            : "Image must be smaller than 8 MB",
        },
        { status: 400 },
      );
    }

    // Restrict uploads to project media folders
    if (!/^devmalitos(\/[a-z0-9_-]+)?$/i.test(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      folder,
      publicId,
      resourceType: isVideo ? "video" : "image",
    });

    return NextResponse.json({
      ok: true,
      publicId: result.publicId,
      url: result.url,
      resourceType: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
      publicId?: string;
      resourceType?: string;
    };
    const publicId = body.publicId?.trim() ?? "";
    const resourceType = body.resourceType === "video" ? "video" : "image";

    // Only allow deleting assets inside this project's media folders
    if (!/^devmalitos(\/[a-z0-9_-]+)+$/i.test(publicId)) {
      return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
    }

    const ok = await destroyCloudinaryAsset(publicId, resourceType);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 },
    );
  }
}
