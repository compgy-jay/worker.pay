export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { rows } = await db.execute(
    "SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 100"
  );
  return NextResponse.json(rows);
}
