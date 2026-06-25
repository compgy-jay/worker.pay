import twilio from "twilio";
import type { Twilio } from "twilio";

let _client: Twilio | null = null;
let _warned = false;

function warn(message: string) {
  if (!_warned) {
    console.warn(`[twilio] ${message}`);
    _warned = true;
  }
}

export function getTwilioClient(): Twilio | null {
  if (_client) return _client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    if (process.env.NODE_ENV === "production") {
      warn("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
    }
    return null;
  }

  _client = twilio(accountSid, authToken);
  return _client;
}

export function getTwilioPhoneNumber(): string | null {
  const phone = process.env.TWILIO_PHONE_NUMBER;
  if (!phone) {
    if (process.env.NODE_ENV === "production") {
      warn("TWILIO_PHONE_NUMBER must be set");
    }
    return null;
  }
  return phone;
}

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}
