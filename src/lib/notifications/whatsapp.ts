import { normalizeToE164 } from "@/lib/supabase/phone";
import type { NotificationResult } from "./index";

const SID = process.env.TWILIO_ACCOUNT_SID || "";
const AUTH = process.env.TWILIO_AUTH_TOKEN || "";
const FROM = process.env.TWILIO_WHATSAPP_NUMBER || "";

export async function sendWhatsApp(
  to: string,
  body: string
): Promise<NotificationResult> {
  if (!SID || !AUTH || !FROM) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    const e164 = normalizeToE164(to);
    const payload = new URLSearchParams({
      From: `whatsapp:${FROM}`,
      To: `whatsapp:${e164}`,
      Body: body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${SID}:${AUTH}`).toString("base64")}`,
        },
        body: payload,
      }
    );

    const data = await res.json();

    if (data.error_message) {
      return { success: false, error: data.error_message };
    }

    return { success: true, id: data.sid };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
