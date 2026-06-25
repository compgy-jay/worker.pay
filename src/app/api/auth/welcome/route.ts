import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = user.user_metadata?.name || user.email.split("@")[0];

  setImmediate(() => {
    sendNotification({
      channel: "email",
      to: user.email!,
      template: "welcome",
      data: { name, dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard` },
    }).catch(() => {});
  });

  return NextResponse.json({ success: true });
}
