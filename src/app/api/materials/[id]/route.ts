import { NextResponse } from "next/server";
import db from "@/lib/db";

function parseNonNegativeNumber(value: unknown) {
  if (value == null) return null;
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function isValidDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, quantity, unit, cost, date, category, supplier, notes } = await request.json();
  const parsedQuantity = quantity !== undefined ? parseNonNegativeNumber(quantity) : null;
  if (parsedQuantity === undefined) {
    return NextResponse.json({ error: "Quantity must be a non-negative number" }, { status: 400 });
  }
  const parsedCost = cost !== undefined ? parseNonNegativeNumber(cost) : null;
  if (parsedCost === undefined) {
    return NextResponse.json({ error: "Cost must be a non-negative number" }, { status: 400 });
  }
  if (date !== undefined && !isValidDate(date)) {
    return NextResponse.json({ error: "Date must be a YYYY-MM-DD date" }, { status: 400 });
  }
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return NextResponse.json({ error: "Material name is required" }, { status: 400 });
  }
  const result = db
    .prepare(
      `UPDATE materials SET
        name = COALESCE(?, name),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        cost = COALESCE(?, cost),
        date = COALESCE(?, date),
        category = COALESCE(?, category),
        supplier = COALESCE(?, supplier),
        notes = COALESCE(?, notes)
      WHERE id = ?`
    )
    .run(
      name?.trim(),
      parsedQuantity,
      unit,
      parsedCost,
      date,
      category?.trim(),
      supplier?.trim(),
      notes,
      id
    );
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
