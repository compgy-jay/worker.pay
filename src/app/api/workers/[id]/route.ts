import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, contact, department } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  db.prepare("UPDATE workers SET name = ?, contact = ?, department = ? WHERE id = ?")
    .run(name.trim(), contact?.trim() || "", department?.trim() || "", id);
  const worker = db.prepare("SELECT * FROM workers WHERE id = ?").get(id);
  return NextResponse.json(worker);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.prepare("DELETE FROM workers WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
