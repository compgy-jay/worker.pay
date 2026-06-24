export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runDbRoute } from "@/lib/api-route";

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

  return runDbRoute(async () => {
    const result = await db.execute(
      `UPDATE materials SET
      name = COALESCE(?, name),
      quantity = COALESCE(?, quantity),
      unit = COALESCE(?, unit),
      cost = COALESCE(?, cost),
      date = COALESCE(?, date),
      category = COALESCE(?, category),
      supplier = COALESCE(?, supplier),
      notes = COALESCE(?, notes)
    WHERE id = ?`,
      [
        name?.trim(),
        parsedQuantity,
        unit,
        parsedCost,
        date,
        category?.trim(),
        supplier?.trim(),
        notes,
        id,
      ]
    );
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }
    const { rows } = await db.execute("SELECT * FROM materials WHERE id = ?", [id]);
    return NextResponse.json(rows[0]);
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return runDbRoute(async () => {
    const result = await db.execute("DELETE FROM materials WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  });
}
