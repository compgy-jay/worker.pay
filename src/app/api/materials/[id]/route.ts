import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, quantity, unit, cost, date, notes } = await request.json();
  const result = db
    .prepare(
      `UPDATE materials SET
        name = COALESCE(?, name),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        cost = COALESCE(?, cost),
        date = COALESCE(?, date),
        notes = COALESCE(?, notes)
      WHERE id = ?`
    )
    .run(name, quantity, unit, cost != null ? parseFloat(cost) : null, date, notes, id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(id);
  return NextResponse.json(material);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.prepare("DELETE FROM materials WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
