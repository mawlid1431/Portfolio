import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";
import { getSessionTokenHash } from "@/lib/session-server";

export async function POST(request: Request) {
  try {
    const tokenHash = await getSessionTokenHash();
    if (!tokenHash) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    await client.action(api.authActions.changePassword, {
      tokenHash,
      currentPassword,
      newPassword,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Change-password error:", error);
    const raw = error instanceof Error ? error.message : "";
    const safe =
      /incorrect|must be different|data breach|verify password safety|8 characters|200 characters|Unauthorized/i.test(
        raw,
      )
        ? raw
        : "Failed to change password. Please try again.";
    return NextResponse.json({ error: safe }, { status: 400 });
  }
}
