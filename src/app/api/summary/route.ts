import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const salaryTotal = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM salary_records")
    .get() as { total: number };
  const paidTotal = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM salary_records WHERE status = 'paid'")
    .get() as { total: number };
  const unpaidTotal = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM salary_records WHERE status = 'unpaid'")
    .get() as { total: number };
  const materialTotal = db
    .prepare("SELECT COALESCE(SUM(cost), 0) as total FROM materials")
    .get() as { total: number };
  return NextResponse.json({
    salaryTotal: salaryTotal.total,
    paidTotal: paidTotal.total,
    unpaidTotal: unpaidTotal.total,
    materialTotal: materialTotal.total,
    grandTotal: salaryTotal.total + materialTotal.total,
  });
}
