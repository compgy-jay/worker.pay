export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runDbRoute } from "@/lib/api-route";

const PAY_STATUSES = new Set(["paid", "unpaid"]);

function parsePositiveId(value: unknown) {
  const parsed = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeAmount(value: unknown) {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isValidDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("worker_id");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const query = searchParams.get("q");

  let sql =
    "SELECT sr.*, w.name as worker_name, w.contact as worker_contact, w.department as worker_department FROM salary_records sr JOIN workers w ON sr.worker_id = w.id";
  let params: (string | number)[];
  const where: string[] = [];

  if (workerId) {
    const parsedWorkerId = parsePositiveId(workerId);
    if (!parsedWorkerId) {
      return NextResponse.json({ error: "worker_id must be a positive integer" }, { status: 400 });
    }
    where.push("sr.worker_id = ?");
    params = [parsedWorkerId];
  } else {
    params = [];
  }

  if (status) {
    if (!PAY_STATUSES.has(status)) {
      return NextResponse.json({ error: "status must be paid or unpaid" }, { status: 400 });
    }
    where.push("sr.status = ?");
    params.push(status);
  }
  if (from) {
    if (!isValidDate(from)) {
      return NextResponse.json({ error: "from must be a YYYY-MM-DD date" }, { status: 400 });
    }
    where.push("sr.week_start >= ?");
    params.push(from);
  }
  if (to) {
    if (!isValidDate(to)) {
      return NextResponse.json({ error: "to must be a YYYY-MM-DD date" }, { status: 400 });
    }
    where.push("sr.week_start <= ?");
    params.push(to);
  }
  if (query) {
    const like = `%${query.trim()}%`;
    where.push("(w.name LIKE ? OR w.contact LIKE ? OR w.department LIKE ?)");
    params.push(like, like, like);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  sql += " ORDER BY sr.week_start DESC, sr.id DESC";

  return runDbRoute(async () => {
    const { rows } = await db.execute(sql, params);
    return NextResponse.json(rows);
  });
}

export async function POST(request: Request) {
  const { worker_id, week_start, amount, status } = await request.json();
  if (!worker_id || !week_start || amount == null) {
    return NextResponse.json({ error: "worker_id, week_start, and amount are required" }, { status: 400 });
  }
  const parsedWorkerId = parsePositiveId(worker_id);
  if (!parsedWorkerId) {
    return NextResponse.json({ error: "worker_id must be a positive integer" }, { status: 400 });
  }
  if (!isValidDate(week_start)) {
    return NextResponse.json({ error: "week_start must be a YYYY-MM-DD date" }, { status: 400 });
  }
  const parsedAmount = parseNonNegativeAmount(amount);
  if (parsedAmount == null) {
    return NextResponse.json({ error: "Amount must be a non-negative number" }, { status: 400 });
  }
  const payStatus = status || "unpaid";
  if (!PAY_STATUSES.has(payStatus)) {
    return NextResponse.json({ error: "status must be paid or unpaid" }, { status: 400 });
  }

  return runDbRoute(async () => {
    const workerResult = await db.execute("SELECT id FROM workers WHERE id = ?", [parsedWorkerId]);
    if (!workerResult.rows[0]) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    const result = await db.execute(
      "INSERT INTO salary_records (worker_id, week_start, amount, status) VALUES (?, ?, ?, ?)",
      [parsedWorkerId, week_start, parsedAmount, payStatus]
    );
    const { rows } = await db.execute("SELECT * FROM salary_records WHERE id = ?", [Number(result.lastInsertRowid!)]);
    return NextResponse.json(rows[0], { status: 201 });
  });
}
