export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runDbRoute } from "@/lib/api-route";

export async function GET() {
  return runDbRoute(async () => {
    const { rows } = await db.execute("SELECT * FROM workers ORDER BY created_at DESC");
    return NextResponse.json(rows);
  });
}

export async function POST(request: Request) {
  const { name, contact, department } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  return runDbRoute(async () => {
    const result = await db.execute(
      "INSERT INTO workers (name, contact, department) VALUES (?, ?, ?)",
      [name.trim(), contact?.trim() || "", department?.trim() || ""]
    );
    const { rows } = await db.execute("SELECT * FROM workers WHERE id = ?", [Number(result.lastInsertRowid!)]);
    return NextResponse.json(rows[0], { status: 201 });
  });
}
