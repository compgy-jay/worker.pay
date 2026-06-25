export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

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

  const { rows: before } = await db.execute(
    "SELECT sr.*, w.name as worker_name, w.contact as worker_contact FROM salary_records sr JOIN workers w ON sr.worker_id = w.id WHERE sr.id = ?",
    [id]
  );
  const record = before[0] as unknown as { status: string; worker_name: string; worker_contact: string; amount: number; week_start: string } | undefined;

  const result = await db.execute(
    `UPDATE salary_records SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  setImmediate(() => {
    if (record && status === "paid" && record.status !== "paid") {
      sendNotification({
        channel: "whatsapp",
        to: record.worker_contact,
        template: "wage-paid",
        data: { workerName: record.worker_name, amount: String(record.amount), weekStart: record.week_start, currency: "KES" },
      }).catch(() => {});
    }
  });

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
