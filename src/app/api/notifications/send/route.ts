export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const { channel, to, template, data } = await request.json();
  if (!channel || !to) {
    return NextResponse.json({ error: "channel and to are required" }, { status: 400 });
  }

  const result = await sendNotification({
    channel,
    to,
    template: template || "wage-paid",
    data: data || {},
  });

  return NextResponse.json(result);
}
