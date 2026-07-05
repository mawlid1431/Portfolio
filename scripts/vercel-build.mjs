#!/usr/bin/env node
/**
 * Vercel production build: deploy Convex, then build Next.js.
 * Falls back to Next.js-only build when CONVEX_DEPLOY_KEY is missing but
 * NEXT_PUBLIC_CONVEX_URL points at production (Convex already deployed locally).
 */

import { spawnSync } from "node:child_process";

/** Production Convex URL (public — embedded in client bundle). */
const PROD_CONVEX_URL =
  "https://mellow-camel-842.eu-west-1.convex.cloud";

const isVercel = process.env.VERCEL === "1";
const deployKey = process.env.CONVEX_DEPLOY_KEY?.trim();
const convexDeployment = process.env.CONVEX_DEPLOYMENT?.trim();
let convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
const isDevConvexUrl = convexUrl.includes("striped-starfish-858");

function runBuildApp() {
  const result = spawnSync("bun", ["run", "build:app"], {
    stdio: "inherit",
    shell: true,
  });
  process.exit(result.status ?? 1);
}

function runConvexDeploy() {
  const result = spawnSync(
    "bunx",
    ["convex", "deploy", "--cmd", "bun run build:app"],
    { stdio: "inherit", shell: true },
  );
  process.exit(result.status ?? 1);
}

if (isVercel) {
  if (convexDeployment) {
    console.warn(
      `Ignoring CONVEX_DEPLOYMENT on Vercel (${convexDeployment}). Remove it from Vercel env vars.`,
    );
  }

  if (deployKey) {
    runConvexDeploy();
  }

  if (convexUrl && !isDevConvexUrl) {
    console.warn(
      [
        "CONVEX_DEPLOY_KEY not set — building Next.js with NEXT_PUBLIC_CONVEX_URL.",
        `Using: ${convexUrl}`,
        "Run `bun run build` locally when you change Convex functions.",
      ].join("\n"),
    );
    runBuildApp();
  }

  // Public URL — safe to default when Vercel env vars are not configured yet.
  process.env.NEXT_PUBLIC_CONVEX_URL = PROD_CONVEX_URL;
  console.warn(
    [
      "No Convex env on Vercel — using built-in production URL for build.",
      `NEXT_PUBLIC_CONVEX_URL=${PROD_CONVEX_URL}`,
      "",
      "Add Cloudinary, SMTP, ADMIN_SETUP_KEY, NEXT_PUBLIC_SITE_URL on Vercel",
      "so contact form, uploads, and admin work in production.",
    ].join("\n"),
  );
  runBuildApp();
}

if (!deployKey) {
  console.warn(
    "CONVEX_DEPLOY_KEY not set — building Next.js only (Convex not deployed).",
  );
  runBuildApp();
}

runConvexDeploy();
