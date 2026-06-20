export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const PAY_STATUSES = new Set(["paid", "unpaid"]);

function parseNonNegativeAmount(value: unknown) {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isValidDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { week_start, amount, status } = await request.json();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (week_start !== undefined) {
    if (!isValidDate(week_start)) {
      return NextResponse.json({ error: "week_start must be a YYYY-MM-DD date" }, { status: 400 });
    }
    updates.push("week_start = ?");
    values.push(week_start);
  }
  if (amount !== undefined) {
    const parsed = parseNonNegativeAmount(amount);
    if (parsed == null) {
      return NextResponse.json({ error: "Amount must be a non-negative number" }, { status: 400 });
    }
    updates.push("amount = ?");
    values.push(parsed);
  }
  if (status !== undefined) {
    if (!PAY_STATUSES.has(status)) {
      return NextResponse.json({ error: "status must be paid or unpaid" }, { status: 400 });
    }
    updates.push("status = ?");
    values.push(status);
  }
  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  const result = await db.execute(
    `UPDATE salary_records SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  const { rows } = await db.execute("SELECT * FROM salary_records WHERE id = ?", [id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await db.execute("DELETE FROM salary_records WHERE id = ?", [id]);
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
