export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { rows } = await db.execute(
    `SELECT
      COALESCE(SUM(sr.amount), 0) AS salaryTotal,
      COALESCE(SUM(CASE WHEN sr.status = 'paid' THEN sr.amount ELSE 0 END), 0) AS paidTotal,
      COALESCE(SUM(CASE WHEN sr.status = 'unpaid' THEN sr.amount ELSE 0 END), 0) AS unpaidTotal,
      COUNT(sr.id) AS recordCount,
      COALESCE(SUM(CASE WHEN sr.status = 'unpaid' THEN 1 ELSE 0 END), 0) AS unpaidRecordCount,
      (SELECT COUNT(*) FROM workers) AS workerCount,
      (SELECT COALESCE(SUM(cost), 0) FROM materials) AS materialTotal,
      (SELECT COUNT(*) FROM materials) AS materialCount,
      (SELECT COALESCE(budget, 0) FROM project_settings WHERE id = 1) AS budget
    FROM salary_records sr`
  );
  const totals = rows[0] as unknown as {
    salaryTotal: number;
    paidTotal: number;
    unpaidTotal: number;
    materialTotal: number;
    workerCount: number;
    recordCount: number;
    materialCount: number;
    unpaidRecordCount: number;
    budget: number;
  };
  const grandTotal = totals.salaryTotal + totals.materialTotal;
  const budgetRemaining = totals.budget > 0 ? totals.budget - grandTotal : 0;
  const budgetUsedPercent = totals.budget > 0 ? Math.min((grandTotal / totals.budget) * 100, 999) : 0;

  return NextResponse.json({
    ...totals,
    grandTotal,
    budgetRemaining,
    budgetUsedPercent,
  });
}
