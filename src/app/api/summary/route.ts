import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const totals = db
    .prepare(
      `SELECT
        COALESCE((SELECT SUM(amount) FROM salary_records), 0) AS salaryTotal,
        COALESCE((SELECT SUM(amount) FROM salary_records WHERE status = 'paid'), 0) AS paidTotal,
        COALESCE((SELECT SUM(amount) FROM salary_records WHERE status = 'unpaid'), 0) AS unpaidTotal,
        COALESCE((SELECT SUM(cost) FROM materials), 0) AS materialTotal,
        COALESCE((SELECT COUNT(*) FROM workers), 0) AS workerCount,
        COALESCE((SELECT COUNT(*) FROM salary_records), 0) AS recordCount,
        COALESCE((SELECT COUNT(*) FROM salary_records WHERE status = 'unpaid'), 0) AS unpaidRecordCount,
        COALESCE((SELECT COUNT(*) FROM materials), 0) AS materialCount,
        COALESCE((SELECT budget FROM project_settings WHERE id = 1), 0) AS budget`
    )
    .get() as {
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
