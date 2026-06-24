export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sendEmail, sendSMS, sendWhatsApp } from "@/lib/notifications";
import { runDbRoute } from "@/lib/api-route";

export async function POST(request: Request) {
  const { channel, to, subject, message } = await request.json();
  if (!channel || !to || !message) {
    return NextResponse.json({ error: "channel, to, and message are required" }, { status: 400 });
  }

  return runDbRoute(async () => {
    let result;
    switch (channel) {
      case "email":
        result = await sendEmail(to, subject || "No Subject", message);
        break;
      case "sms":
        result = await sendSMS(to, message);
        break;
      case "whatsapp":
        result = await sendWhatsApp(to, message);
        break;
      default:
        return NextResponse.json({ error: "Invalid channel. Use email, sms, or whatsapp" }, { status: 400 });
    }
    return NextResponse.json(result);
  });
}
