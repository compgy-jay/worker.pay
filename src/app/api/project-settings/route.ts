import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const settings = db.prepare("SELECT * FROM project_settings WHERE id = 1").get();
  return NextResponse.json(settings);
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

  db.prepare(
    `UPDATE project_settings SET
      project_name = COALESCE(?, project_name),
      pm_name = COALESCE(?, pm_name),
      pm_contact = COALESCE(?, pm_contact),
      foreman_name = COALESCE(?, foreman_name),
      foreman_contact = COALESCE(?, foreman_contact),
      currency = COALESCE(?, currency),
      budget = COALESCE(?, budget)
    WHERE id = 1`
  ).run(
    project_name?.trim(),
    pm_name?.trim(),
    pm_contact?.trim(),
    foreman_name?.trim(),
    foreman_contact?.trim(),
    currency?.trim().toUpperCase(),
    parsedBudget
  );
  const settings = db.prepare("SELECT * FROM project_settings WHERE id = 1").get();
  return NextResponse.json(settings);
}
