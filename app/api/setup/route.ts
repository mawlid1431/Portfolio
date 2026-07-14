import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { api, getConvexClient } from "@/lib/convex";

export const runtime = "nodejs";

/** Constant-time compare that never early-returns on length. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still do a compare to avoid a length-based timing shortcut.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** One-time admin setup — only works when no admin exists. */
export async function POST(request: Request) {
  try {
    const setupKeyEnv = process.env.ADMIN_SETUP_KEY;
    if (!setupKeyEnv) {
      return NextResponse.json(
        { error: "Admin setup is not configured on this server." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      setupKey?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim() ?? "Admin";
    const setupKey = body.setupKey?.trim();

    if (!email || !password || !setupKey) {
      return NextResponse.json(
        { error: "Email, password, and setup key are required." },
        { status: 400 },
      );
    }

    if (!safeEqual(setupKey, setupKeyEnv)) {
      return NextResponse.json({ error: "Invalid setup key." }, { status: 403 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const adminId = await client.action(api.authActions.initializeAdmin, {
      email,
      password,
      name,
      setupKey,
    });

    return NextResponse.json({ ok: true, adminId });
  } catch (error) {
    console.error("Admin setup error:", error);
    // Generic response — don't reveal whether an admin already exists or leak
    // internal errors to an unauthenticated caller.
    return NextResponse.json(
      { error: "Setup could not be completed." },
      { status: 400 },
    );
  }
}
