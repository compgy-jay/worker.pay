import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && user.email_confirmed_at) {
        const name = user.user_metadata?.name || user.email.split("@")[0];
        setImmediate(() => {
          sendNotification({
            channel: "email",
            to: user.email!,
            template: "welcome",
            data: { name, dashboardUrl: `${origin}/dashboard` },
          }).catch(() => {});
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Unable to verify email`);
}
