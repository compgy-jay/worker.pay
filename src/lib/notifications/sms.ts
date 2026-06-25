import { normalizeToE164 } from "@/lib/supabase/phone";
import type { NotificationResult } from "./index";
import { getTwilioClient, getTwilioPhoneNumber } from "@/utils/twilio";

export async function sendSMS(
  to: string,
  message: string
): Promise<NotificationResult> {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  if (!client || !from) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    const e164 = normalizeToE164(to);
    const result = await client.messages.create({
      to: e164,
      from,
      body: message,
    });

    return { success: true, id: result.sid };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
