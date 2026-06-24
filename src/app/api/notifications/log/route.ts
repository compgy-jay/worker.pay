export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runDbRoute } from "@/lib/api-route";

export async function GET() {
  return runDbRoute(async () => {
    const { rows } = await db.execute(
      "SELECT * FROM notification_log ORDER BY created_at DESC LIMIT 100"
    );
    return NextResponse.json(rows);
  });
}
