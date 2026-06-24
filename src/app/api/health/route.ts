export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDatabaseStatus, waitReady } from "@/lib/db";
import { runDbRoute } from "@/lib/api-route";

export async function GET() {
  const status = getDatabaseStatus();
  if (!status.ok) {
    return NextResponse.json(
      {
        status: "misconfigured",
        database: status,
        hint: "Set DATABASE_URL and DATABASE_AUTH_TOKEN on Vercel. See docs/VERCEL_DEPLOYMENT.md.",
      },
      { status: 503 }
    );
  }

  return runDbRoute(async () => {
    await waitReady();
    return NextResponse.json({
      status: "healthy",
      database: status,
    });
  });
}
