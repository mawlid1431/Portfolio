#!/usr/bin/env node
/**
 * Pre-deploy env check. Run locally with production-like vars:
 *   bun run verify:deploy
 */

const vercelOnly = ["CONVEX_DEPLOY_KEY"];

const required = [
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_TO",
  "ADMIN_SETUP_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

const convexDashboard = [
  "ADMIN_SETUP_KEY (Convex production environment — Settings → Environment Variables)",
];

const missing = required.filter((key) => !process.env[key]?.trim());
const missingVercel = vercelOnly.filter((key) => !process.env[key]?.trim());

let failed = false;

if (missing.length) {
  failed = true;
  console.error("Missing required environment variables:");
  for (const key of missing) console.error(`  - ${key}`);
}

if (process.env.VERCEL === "1" && missingVercel.length) {
  failed = true;
  console.error("\nMissing Vercel production variables:");
  for (const key of missingVercel) console.error(`  - ${key}`);
  console.error(
    "\nGenerate CONVEX_DEPLOY_KEY: Convex Dashboard → Settings → Deploy Key",
  );
}

if (
  process.env.VERCEL === "1" &&
  process.env.CONVEX_DEPLOYMENT?.trim()
) {
  console.warn(
    "\nWarning: CONVEX_DEPLOYMENT is set on Vercel — remove it (dev-only var).",
  );
}

if (process.env.VERCEL === "1" && process.env.CONVEX_DEPLOYMENT?.trim()) {
  failed = true;
  console.error(
    "\nRemove CONVEX_DEPLOYMENT from Vercel. It conflicts with CONVEX_DEPLOY_KEY and forces the dev deployment.",
  );
}

if (process.env.ADMIN_SETUP_KEY === "devmalitos-setup") {
  failed = true;
  console.error("\nADMIN_SETUP_KEY is still the dev default. Set a strong secret.");
}

if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
  console.warn("\nWarning: NEXT_PUBLIC_SITE_URL points to localhost.");
}

console.log("\nAlso set in Convex production dashboard:");
for (const line of convexDashboard) console.log(`  - ${line}`);

if (failed) {
  process.exit(1);
}

console.log("\nDeploy env check passed.");
