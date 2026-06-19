import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const workers = db.prepare("SELECT * FROM workers ORDER BY created_at DESC").all();
  return NextResponse.json(workers);
}

export async function POST(request: Request) {
  const { name, contact, department } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const result = db
    .prepare("INSERT INTO workers (name, contact, department) VALUES (?, ?, ?)")
    .run(name.trim(), contact?.trim() || "", department?.trim() || "");
  const worker = db.prepare("SELECT * FROM workers WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(worker, { status: 201 });
}
