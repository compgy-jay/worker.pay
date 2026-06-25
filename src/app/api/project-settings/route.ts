export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

export async function GET() {
  const { rows } = await db.execute("SELECT * FROM project_settings WHERE id = 1");
  return NextResponse.json(rows[0]);
}

async function grandTotalSpend(): Promise<number> {
  const { rows } = await db.execute(
    `SELECT COALESCE((SELECT SUM(amount) FROM salary_records), 0) + COALESCE((SELECT SUM(cost) FROM materials), 0) AS total`
  );
  return Number((rows[0] as any).total);
}

export async function PUT(request: Request) {
  const {
    project_name,
    pm_name,
    pm_contact,
    foreman_name,
    foreman_contact,
    currency,
    budget,
  } = await request.json();
  const parsedBudget = budget == null || budget === "" ? null : Number(budget);
  if (parsedBudget != null && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
    return NextResponse.json({ error: "Budget must be a non-negative number" }, { status: 400 });
  }
  if (currency !== undefined && (typeof currency !== "string" || currency.trim().length !== 3)) {
    return NextResponse.json({ error: "Currency must be a 3-letter code" }, { status: 400 });
  }

  const { rows: before } = await db.execute("SELECT * FROM project_settings WHERE id = 1");
  const oldSettings = before[0] as unknown as { budget: number; pm_name: string; pm_contact: string; project_name: string; currency: string } | undefined;

  await db.execute(
    `UPDATE project_settings SET
      project_name = COALESCE(?, project_name),
      pm_name = COALESCE(?, pm_name),
      pm_contact = COALESCE(?, pm_contact),
      foreman_name = COALESCE(?, foreman_name),
      foreman_contact = COALESCE(?, foreman_contact),
      currency = COALESCE(?, currency),
      budget = COALESCE(?, budget)
    WHERE id = 1`,
    [
      project_name?.trim(),
      pm_name?.trim(),
      pm_contact?.trim(),
      foreman_name?.trim(),
      foreman_contact?.trim(),
      currency?.trim().toUpperCase(),
      parsedBudget,
    ]
  );

  setImmediate(async () => {
    try {
      const totalSpend = await grandTotalSpend();
      const newBudget = parsedBudget ?? oldSettings?.budget ?? 0;
      const usedPercent = newBudget > 0 ? (totalSpend / newBudget) * 100 : 0;

      if (usedPercent >= 80 && oldSettings?.budget !== newBudget) {
        const settings = await db.execute("SELECT * FROM project_settings WHERE id = 1");
        const s = settings.rows[0] as unknown as { pm_contact: string; pm_name: string; project_name: string; budget: number; currency: string };
        if (s.pm_contact) {
          sendNotification({
            channel: s.pm_contact.includes("@") ? "email" : "whatsapp",
            to: s.pm_contact,
            template: "budget-threshold",
            data: {
              projectName: s.project_name || "Project",
              pmName: s.pm_name || "Project Manager",
              usedPercent: usedPercent.toFixed(1),
              usedAmount: String(totalSpend),
              budget: String(s.budget),
              currency: s.currency || "KES",
            },
          }).catch(() => {});
        }
      }
    } catch {
      // budget alert is fire-and-forget
    }
  });

  const { rows } = await db.execute("SELECT * FROM project_settings WHERE id = 1");
  return NextResponse.json(rows[0]);
}
