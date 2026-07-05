#!/usr/bin/env node
/**
 * Send all email templates to CONTACT_TO (or SMTP_USER) to verify SMTP works.
 *   node scripts/test-email.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import nodemailer from "nodemailer";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn("No .env.local found — using existing environment variables.");
  }
}

loadEnvLocal();

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? user;
const to = process.env.CONTACT_TO ?? user;

if (!user || !pass || !to) {
  console.error("Missing SMTP_USER, SMTP_PASS, or CONTACT_TO in .env.local");
  process.exit(1);
}

const brand = { emerald: "#10b981", cream: "#f5f0e8" };

function layout(title, body) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#0a0f0d;font-family:Arial,sans-serif;">
<table width="100%" style="background:#0a0f0d;padding:40px 16px;"><tr><td align="center">
<table style="max-width:560px;background:#111916;border:1px solid rgba(16,185,129,0.25);border-radius:16px;">
<tr><td style="padding:32px;color:${brand.cream};">
<p style="font-size:28px;font-weight:bold;">MALITOS<span style="color:${brand.emerald};">.</span></p>
<p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af;">${title}</p>
<div style="margin-top:16px;font-size:15px;line-height:1.6;">${body}</div>
</td></tr></table></td></tr></table></body></html>`;
}

const templates = [
  {
    id: "password-reset",
    subject: "[TEST] Your Malitos admin reset code",
    text: "Your Malitos admin reset code: 482910\n\nThis code expires in 15 minutes.",
    html: layout(
      "Password reset code",
      `<p style="color:#d1d5db;">Test reset email.</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:0.35em;color:${brand.emerald};font-family:monospace;">482910</p>
       <p style="color:#9ca3af;font-size:13px;">Expires in 15 minutes.</p>`,
    ),
  },
  {
    id: "contact-admin",
    subject: "[TEST] New inquiry from Alex Rivera",
    text: "New contact from Alex Rivera\nEmail: alex@example.com\nBudget: $5k – $10k",
    html: layout(
      "New contact message",
      `<p style="color:#d1d5db;">Test admin contact notification.</p>
       <p style="color:${brand.cream};">Alex Rivera · alex@example.com</p>`,
    ),
  },
  {
    id: "contact-user",
    subject: "[TEST] Thanks for reaching out — Malitos",
    text: "Hi Alex,\n\nThanks for reaching out. Test auto-reply.",
    html: layout(
      "Message received",
      `<p style="color:${brand.cream};">Hi Alex,</p>
       <p style="color:#d1d5db;">Test user confirmation email.</p>`,
    ),
  },
];

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: { user, pass },
});

console.log("Verifying SMTP connection…");
await transporter.verify();
console.log("SMTP OK\n");

for (const template of templates) {
  console.log(`Sending ${template.id} → ${to}`);
  const info = await transporter.sendMail({
    from: `Malitos <${from}>`,
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
  console.log(`  ✓ ${info.messageId}`);
}

console.log("\nAll 3 test emails sent. Check your inbox.");
console.log("Preview in browser: http://localhost:3000/dev/email-preview");
