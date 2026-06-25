import { normalizeToE164 } from "@/lib/supabase/phone";
import type { NotificationResult } from "./index";

const USERNAME = process.env.AFRICASTALKING_USERNAME || "";
const API_KEY = process.env.AFRICASTALKING_API_KEY || "";

export async function sendSMS(
  to: string,
  message: string
): Promise<NotificationResult> {
  if (!USERNAME || !API_KEY) {
    return { success: false, error: "Africa's Talking credentials not configured" };
  }

  try {
    const e164 = normalizeToE164(to);
    const res = await fetch(
      "https://api.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ApiKey: API_KEY,
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: USERNAME,
          to: e164,
          message,
        }),
      }
    );

    const data = await res.json();

    if (data.errorMessage) {
      return { success: false, error: data.errorMessage };
    }

    const recipient = data?.SMSMessageData?.Recipients?.[0];
    return { success: true, id: recipient?.messageId };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
