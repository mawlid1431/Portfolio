#!/usr/bin/env node
/**
 * Vercel production build: deploy Convex, then build Next.js.
 * Fails fast with actionable errors when env vars are misconfigured.
 */

import { spawnSync } from "node:child_process";

const isVercel = process.env.VERCEL === "1";
const deployKey = process.env.CONVEX_DEPLOY_KEY?.trim();
const convexDeployment = process.env.CONVEX_DEPLOYMENT?.trim();

if (isVercel) {
  if (!deployKey) {
    console.error(
      [
        "Convex build failed: CONVEX_DEPLOY_KEY is missing on Vercel.",
        "",
        "Fix:",
        "  1. Convex Dashboard → Production deployment → Settings → General",
        "  2. Generate Production Deploy Key (enable deployment:deploy)",
        "  3. Vercel → Settings → Environment Variables",
        "  4. Add CONVEX_DEPLOY_KEY for the Production environment",
        "  5. Redeploy (env changes do not apply to past builds)",
        "",
        "Do NOT set CONVEX_DEPLOYMENT on Vercel.",
      ].join("\n"),
    );
    process.exit(1);
  }

  if (convexDeployment) {
    console.error(
      [
        "Convex build failed: CONVEX_DEPLOYMENT must not be set on Vercel.",
        "",
        `Found: CONVEX_DEPLOYMENT=${convexDeployment}`,
        "",
        "This forces the dev deployment and bypasses CONVEX_DEPLOY_KEY.",
        "Remove CONVEX_DEPLOYMENT from Vercel env vars, then redeploy.",
        "",
        "Also remove NEXT_PUBLIC_CONVEX_URL from Vercel — convex deploy sets it.",
      ].join("\n"),
    );
    process.exit(1);
  }

  if (process.env.NEXT_PUBLIC_CONVEX_URL?.includes("striped-starfish-858")) {
    console.warn(
      "Warning: NEXT_PUBLIC_CONVEX_URL points at the dev deployment. Remove it from Vercel so convex deploy can inject the production URL.",
    );
  }

  const result = spawnSync(
    "bunx",
    ["convex", "deploy", "--cmd", "bun run build:app"],
    { stdio: "inherit", shell: true },
  );
  process.exit(result.status ?? 1);
}

if (!deployKey) {
  console.warn(
    "CONVEX_DEPLOY_KEY not set — building Next.js only (Convex not deployed).",
  );
  const result = spawnSync("bun", ["run", "build:app"], {
    stdio: "inherit",
    shell: true,
  });
  process.exit(result.status ?? 1);
}

const result = spawnSync(
  "bunx",
  ["convex", "deploy", "--cmd", "bun run build:app"],
  { stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
