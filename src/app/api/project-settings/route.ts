import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const settings = db.prepare("SELECT * FROM project_settings WHERE id = 1").get();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const { project_name, pm_name, pm_contact, foreman_name, foreman_contact } = await request.json();
  db.prepare(
    `UPDATE project_settings SET
      project_name = COALESCE(?, project_name),
      pm_name = COALESCE(?, pm_name),
      pm_contact = COALESCE(?, pm_contact),
      foreman_name = COALESCE(?, foreman_name),
      foreman_contact = COALESCE(?, foreman_contact)
    WHERE id = 1`
  ).run(project_name, pm_name, pm_contact, foreman_name, foreman_contact);
  const settings = db.prepare("SELECT * FROM project_settings WHERE id = 1").get();
  return NextResponse.json(settings);
}
