export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { rows } = await db.execute(
    "SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 100"
  );
  return NextResponse.json(rows);
}
