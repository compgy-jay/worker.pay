export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTwilioClient, getTwilioPhoneNumber } from "@/utils/twilio";

export async function POST(request: Request) {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  if (!client || !from) {
    return NextResponse.json(
      { error: "Twilio is not configured" },
      { status: 500 }
    );
  }

  let body: { to?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { to, message } = body;

  if (!to || !message) {
    return NextResponse.json(
      { error: "to and message are required" },
      { status: 400 }
    );
  }

  try {
    const result = await client.messages.create({
      to,
      from,
      body: message,
    });

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
