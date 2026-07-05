/**
 * Upload placeholder images to Cloudinary under devmalitos/.
 * Run once: node scripts/seed-cloudinary.mjs
 * Replace with real photos via Admin → Images / Projects upload.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

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

const SECTIONS = ["hero", "working", "portrait", "flag", "graduation"];

const PROJECTS = [
  "callback-ai",
  "pure-crm",
  "somalisk-studenter",
  "barkulan-fintech",
  "mubarak-charity",
  "digital-empowerment-hub",
  "hodogiire",
  "tamarsan-energy",
  "nujuum-arts",
  "hargeisa-now",
  "team-united-4-hope",
  "umrah-rejzer",
  "skydanubia",
];

async function uploadRemote(publicId, width, height) {
  const seed = publicId.replace(/\//g, "-");
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
  const result = await cloudinary.uploader.upload(url, {
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  console.log("✓", result.public_id);
}

async function uploadVideoRemote(publicId) {
  const url = "https://www.w3schools.com/html/mov_bbb.mp4";
  const result = await cloudinary.uploader.upload(url, {
    public_id: publicId,
    overwrite: true,
    resource_type: "video",
  });
  console.log("✓", result.public_id, "(video)");
}

async function main() {
  console.log("Seeding Cloudinary placeholders…\n");

  for (const key of SECTIONS) {
    await uploadRemote(`devmalitos/${key}`, 1400, 900);
  }

  for (const slug of PROJECTS) {
    await uploadRemote(`devmalitos/projects/${slug}`, 1200, 800);
  }

  await uploadVideoRemote("devmalitos/about-showreel");

  console.log("\nDone. Refresh your site to see images and the about showreel.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
