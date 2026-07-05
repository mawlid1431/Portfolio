const brand = {
  emerald: "#10b981",
  ink: "#0a0f0d",
  cream: "#f5f0e8",
};

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f0d;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0d;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#111916;border:1px solid rgba(16,185,129,0.25);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 16px;">
          <p style="margin:0;font-size:28px;font-weight:bold;color:${brand.cream};letter-spacing:0.05em;">
            MALITOS<span style="color:${brand.emerald};">.</span>
          </p>
          <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#9ca3af;">${title}</p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px;color:${brand.cream};font-size:15px;line-height:1.6;">${body}</td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid rgba(245,240,232,0.08);">
          <p style="margin:0;font-size:12px;color:#6b7280;">Mowlid Haibe · Software Engineer & AI Innovator</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function contactAdminEmail({
  name,
  email,
  budget,
  message,
}: {
  name: string;
  email: string;
  budget: string;
  message: string;
}) {
  const body = `
    <p style="margin:0 0 20px;color:#d1d5db;">Someone reached out through your portfolio contact form.</p>
    <table width="100%" style="border-collapse:collapse;">
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(245,240,232,0.08);color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">Name</td></tr>
      <tr><td style="padding:4px 0 16px;color:${brand.cream};">${escapeHtml(name)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(245,240,232,0.08);color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">Email</td></tr>
      <tr><td style="padding:4px 0 16px;"><a href="mailto:${escapeHtml(email)}" style="color:${brand.emerald};">${escapeHtml(email)}</a></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(245,240,232,0.08);color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">Budget</td></tr>
      <tr><td style="padding:4px 0 16px;color:${brand.cream};">${escapeHtml(budget)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(245,240,232,0.08);color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;">Message</td></tr>
      <tr><td style="padding:4px 0 0;color:${brand.cream};white-space:pre-wrap;">${escapeHtml(message)}</td></tr>
    </table>
    <p style="margin:24px 0 0;"><a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:${brand.emerald};color:#0a0f0d;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;">Reply to ${escapeHtml(name)}</a></p>
  `;
  return {
    subject: `New inquiry from ${name}`,
    html: layout("New contact message", body),
    text: `New contact from ${name}\nEmail: ${email}\nBudget: ${budget}\n\n${message}`,
  };
}

export function contactUserEmail({ name }: { name: string }) {
  const body = `
    <p style="margin:0 0 16px;color:${brand.cream};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:#d1d5db;">Thanks for reaching out through my portfolio. I've received your message and will get back to you within 24–48 hours.</p>
    <p style="margin:0 0 16px;color:#d1d5db;">In the meantime, feel free to explore my recent projects or connect on social media.</p>
    <p style="margin:24px 0 0;"><a href="https://malitos.dev" style="display:inline-block;background:${brand.emerald};color:#0a0f0d;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:12px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;">Visit portfolio</a></p>
  `;
  return {
    subject: "Thanks for reaching out — Malitos",
    html: layout("Message received", body),
    text: `Hi ${name},\n\nThanks for reaching out. I've received your message and will reply within 24–48 hours.\n\n— Mowlid Haibe`,
  };
}

export function passwordResetCodeEmail({ code }: { code: string }) {
  const body = `
    <p style="margin:0 0 16px;color:#d1d5db;">We received a request to reset your Malitos admin password.</p>
    <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Enter this 6-digit code on the reset page:</p>
    <p style="margin:0 0 24px;font-size:32px;font-weight:bold;letter-spacing:0.35em;color:${brand.emerald};font-family:monospace;">${escapeHtml(code)}</p>
    <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">This code expires in 1 hour. If you didn't request this, ignore this email.</p>
    <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">Never share this code with anyone.</p>
  `;
  return {
    subject: "Your Malitos admin reset code",
    html: layout("Password reset code", body),
    text: `Your Malitos admin reset code: ${code}\n\nThis code expires in 1 hour. Never share it with anyone.`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
