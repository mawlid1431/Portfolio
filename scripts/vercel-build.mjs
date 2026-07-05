#!/usr/bin/env node
/**
 * Vercel production build: deploy Convex, then build Next.js.
 * Falls back to Next.js-only build when CONVEX_DEPLOY_KEY is missing but
 * NEXT_PUBLIC_CONVEX_URL points at production (Convex already deployed locally).
 */

import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1";
const deployKey = process.env.CONVEX_DEPLOY_KEY?.trim();
const convexDeployment = process.env.CONVEX_DEPLOYMENT?.trim();
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
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
    console.error(
      [
        "Convex build failed: CONVEX_DEPLOYMENT must not be set on Vercel.",
        "",
        `Found: CONVEX_DEPLOYMENT=${convexDeployment}`,
        "",
        "Remove CONVEX_DEPLOYMENT from Vercel, then redeploy.",
      ].join("\n"),
    );
    process.exit(1);
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

  const convexVars = Object.keys(process.env)
    .filter((key) => key.includes("CONVEX"))
    .sort();

  console.error(
    [
      "Convex build failed: set CONVEX_DEPLOY_KEY or NEXT_PUBLIC_CONVEX_URL on Vercel.",
      "",
      convexVars.length
        ? `Convex vars found: ${convexVars.join(", ")}`
        : "No CONVEX_* variables found — import env vars to Vercel.",
      "",
      "Option A (recommended): add CONVEX_DEPLOY_KEY from Convex Production → Settings → General",
      "Option B (quick fix): add NEXT_PUBLIC_CONVEX_URL=https://mellow-camel-842.eu-west-1.convex.cloud",
      "",
      "Also add your other vars (Cloudinary, SMTP, ADMIN_SETUP_KEY, NEXT_PUBLIC_SITE_URL).",
      "Do NOT set CONVEX_DEPLOYMENT on Vercel.",
    ].join("\n"),
  );
  process.exit(1);
}

if (!deployKey) {
  console.warn(
    "CONVEX_DEPLOY_KEY not set — building Next.js only (Convex not deployed).",
  );
  runBuildApp();
}

runConvexDeploy();
