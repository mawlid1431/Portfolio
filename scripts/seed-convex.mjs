/**
 * Seed Convex CMS tables from default site content.
 * Run: node scripts/seed-convex.mjs
 *
 * Requires .env.local with NEXT_PUBLIC_CONVEX_URL and admin credentials:
 *   SEED_ADMIN_EMAIL=...
 *   SEED_ADMIN_PASSWORD=...
 */
import { createHash, randomBytes } from "crypto";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { ConvexHttpClient } from "convex/browser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() || env.NEXT_PUBLIC_CONVEX_URL?.trim();
const email = process.env.SEED_ADMIN_EMAIL?.trim() || env.SEED_ADMIN_EMAIL?.trim();
const password = process.env.SEED_ADMIN_PASSWORD?.trim() || env.SEED_ADMIN_PASSWORD?.trim();

if (!convexUrl) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env.local",
  );
  process.exit(1);
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

const client = new ConvexHttpClient(convexUrl);

const rawToken = randomBytes(32).toString("hex");
const tokenHash = hashValue(rawToken);

console.log("Logging in as admin…");
await client.action("authActions:login", {
  email,
  password,
  tokenHash,
  userAgent: "seed-convex-script",
  ipHash: hashValue("seed-script"),
  rateLimitKey: "login:seed-script",
});

console.log("Importing default CMS content…");
const result = await client.mutation("dashboard:importDefaults", { tokenHash });

console.log("Seed complete:");
console.log(`  projects:    +${result.projects}`);
console.log(`  images:      +${result.images}`);
console.log(`  experiences: +${result.experiences}`);
console.log(`  faqs:        +${result.faqs}`);
console.log(`  socials:     +${result.socials}`);

try {
  const projects = await client.query("projects:listPublic", {});
  console.log(`\nConvex now has ${projects.length} public project(s).`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.warn(`\nCould not verify project count: ${message}`);
}
