import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }
  return user;
}

export async function requireUserApi() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
