import { NextResponse } from "next/server";
import { DatabaseConfigError, waitReady } from "@/lib/db";

export async function runDbRoute<T extends Response>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    await waitReady();
    return await handler();
  } catch (error) {
    if (error instanceof DatabaseConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Database route error:", error);
    const message =
      error instanceof Error ? error.message : "Database operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
