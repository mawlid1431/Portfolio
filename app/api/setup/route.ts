import { NextResponse } from "next/server";
import { api, getConvexClient } from "@/lib/convex";

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

    if (setupKey !== setupKeyEnv) {
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
    const message = error instanceof Error ? error.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
