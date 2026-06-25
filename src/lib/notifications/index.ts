import { db } from "@/lib/db";
import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";
import { sendSMS } from "./sms";

export type Channel = "email" | "whatsapp" | "sms";

export interface NotificationRequest {
  channel: Channel;
  to: string;
  template: string;
  data: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  id?: string;
  error?: string;
}

async function logNotification(
  channel: string,
  recipient: string,
  subject: string,
  message: string,
  status: string
) {
  try {
    await db.execute(
      `INSERT INTO notification_log (channel, recipient, subject, message, status) VALUES (?, ?, ?, ?, ?)`,
      [channel, recipient, subject, message, status]
    );
  } catch {
    // Logging should never throw — fire-and-forget
  }
}

function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    data[key] !== undefined ? String(data[key]) : `{{${key}}}`
  );
}

export async function sendNotification(
  req: NotificationRequest
): Promise<NotificationResult> {
  const { channel, to, template: templateName, data } = req;

  let templates: { subject: string; body: string };

  try {
    templates = (await import(`./templates/${channel}/${templateName}`)).default;
  } catch {
    return { success: false, error: `Template not found: ${templateName} for channel ${channel}` };
  }

  const subject = renderTemplate(templates.subject, data);
  const body = renderTemplate(templates.body, data);

  let result: NotificationResult;

  switch (channel) {
    case "email":
      result = await sendEmail(to, subject, body);
      break;
    case "whatsapp":
      result = await sendWhatsApp(to, body);
      break;
    case "sms":
      result = await sendSMS(to, body);
      break;
    default:
      return { success: false, error: `Unknown channel: ${channel}` };
  }

  await logNotification(channel, to, subject, body, result.success ? "sent" : "failed");

  if (!result.success) {
    console.error(
      `[notifications] ${channel} to ${to} failed: ${result.error}`
    );
  }

  return result;
}
