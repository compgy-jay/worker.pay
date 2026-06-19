import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("worker_id");
  const status = searchParams.get("status");

  let sql: string;
  let params: (string | number)[];

  if (workerId) {
    sql = "SELECT * FROM salary_records WHERE worker_id = ?";
    params = [parseInt(workerId)];
  } else {
    sql = "SELECT sr.*, w.name as worker_name, w.contact as worker_contact FROM salary_records sr JOIN workers w ON sr.worker_id = w.id";
    params = [];
  }

  if (status) {
    sql += " AND sr.status = ?";
    params.push(status);
  }

  sql += " ORDER BY sr.week_start DESC";
  const records = db.prepare(sql).all(...params);
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const { worker_id, week_start, amount, status } = await request.json();
  if (!worker_id || !week_start || amount == null) {
    return NextResponse.json({ error: "worker_id, week_start, and amount are required" }, { status: 400 });
  }
  const worker = db.prepare("SELECT id FROM workers WHERE id = ?").get(worker_id);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount)) {
    return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });
  }
  const payStatus = status || "unpaid";
  const result = db
    .prepare("INSERT INTO salary_records (worker_id, week_start, amount, status) VALUES (?, ?, ?, ?)")
    .run(worker_id, week_start, parsedAmount, payStatus);
  const record = db.prepare("SELECT * FROM salary_records WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(record, { status: 201 });
}
