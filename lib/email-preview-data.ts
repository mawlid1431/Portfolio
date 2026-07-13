import {
  contactAdminEmail,
  contactUserEmail,
  passwordResetCodeEmail,
} from "./email-templates";

export type EmailTemplateId =
  | "password-reset"
  | "contact-admin"
  | "contact-user";

export type EmailTemplatePreview = {
  id: EmailTemplateId;
  label: string;
  description: string;
  subject: string;
  html: string;
  text: string;
};

const SAMPLE = {
  name: "Alex Rivera",
  email: "alex@example.com",
  budget: "$5k – $10k",
  message:
    "Hi Mowlid,\n\nI'm looking for help building an AI-powered dashboard for our startup. Would love to chat about timeline and pricing.\n\nThanks!",
  code: "482910",
};

export const EMAIL_TEMPLATE_META: {
  id: EmailTemplateId;
  label: string;
  description: string;
}[] = [
  {
    id: "password-reset",
    label: "Password reset code",
    description: "Sent when an admin requests a forgot-password code.",
  },
  {
    id: "contact-admin",
    label: "Contact — admin notification",
    description: "Sent to you when someone submits the portfolio contact form.",
  },
  {
    id: "contact-user",
    label: "Contact — user confirmation",
    description: "Auto-reply sent to the person who submitted the contact form.",
  },
];

export function getEmailTemplatePreview(
  id: EmailTemplateId,
): EmailTemplatePreview {
  const meta = EMAIL_TEMPLATE_META.find((t) => t.id === id);
  if (!meta) {
    throw new Error(`Unknown email template: ${id}`);
  }

  let template: { subject: string; html: string; text: string };

  switch (id) {
    case "password-reset":
      template = passwordResetCodeEmail({ code: SAMPLE.code });
      break;
    case "contact-admin":
      template = contactAdminEmail({
        name: SAMPLE.name,
        email: SAMPLE.email,
        budget: SAMPLE.budget,
        message: SAMPLE.message,
      });
      break;
    case "contact-user":
      template = contactUserEmail({ name: SAMPLE.name });
      break;
  }

  return { ...meta, ...template };
}

export function getAllEmailTemplatePreviews(): EmailTemplatePreview[] {
  return EMAIL_TEMPLATE_META.map((meta) => getEmailTemplatePreview(meta.id));
}
