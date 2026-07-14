/**
 * Migrate media from the old Cloudinary account (public URLs) into the new
 * account configured in .env.local, keeping the same public IDs.
 * Run: node scripts/migrate-cloudinary.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { ConvexHttpClient } from "convex/browser";

const OLD_CLOUD = "djoqcrbq5";
const PROD_CONVEX_URL = "https://mellow-camel-842.eu-west-1.convex.cloud";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log(`Migrating ${OLD_CLOUD} → ${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);

const client = new ConvexHttpClient(PROD_CONVEX_URL);

const images = new Set();
const videos = new Set();

// Site section media from the production database
const siteImages = await client.query("siteImages:listPublic", {});
for (const img of siteImages) {
  if (img.key === "about-showreel") videos.add(img.cloudinaryPath);
  else images.add(img.cloudinaryPath);
}

// Fallback section paths in case some records are missing
for (const key of ["hero", "working", "portrait", "flag", "graduation"]) {
  images.add(`devmalitos/${key}`);
}
videos.add("devmalitos/about-showreel");

// Project images from the production database (all statuses via public list + slugs)
const projects = await client.query("projects:listPublic", {});
for (const p of projects) {
  if (p.imagePath) images.add(p.imagePath);
}

let ok = 0;
let failed = 0;

async function migrate(publicId, resourceType) {
  const sourceUrl = `https://res.cloudinary.com/${OLD_CLOUD}/${resourceType}/upload/${publicId}`;
  try {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      public_id: publicId,
      overwrite: false,
      resource_type: resourceType,
    });
    ok++;
    console.log("✓", result.public_id);
  } catch (error) {
    failed++;
    const message = error?.message ?? error?.error?.message ?? String(error);
    console.warn("✗", publicId, "—", message);
  }
}

for (const id of images) await migrate(id, "image");
for (const id of videos) await migrate(id, "video");

console.log(`\nDone: ${ok} migrated, ${failed} failed.`);
