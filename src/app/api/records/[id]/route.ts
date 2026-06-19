import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { week_start, amount, status } = await request.json();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (week_start !== undefined) {
    updates.push("week_start = ?");
    values.push(week_start);
  }
  if (amount !== undefined) {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) {
      return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });
    }
    updates.push("amount = ?");
    values.push(parsed);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const result = db
    .prepare(`UPDATE salary_records SET ${updates.join(", ")} WHERE id = ?`)
    .run(...values);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  const record = db.prepare("SELECT * FROM salary_records WHERE id = ?").get(id);
  return NextResponse.json(record);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.prepare("DELETE FROM salary_records WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
