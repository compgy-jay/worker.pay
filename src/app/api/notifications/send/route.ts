export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
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
