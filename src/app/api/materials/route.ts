import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const materials = db.prepare("SELECT * FROM materials ORDER BY date DESC").all();
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const { name, quantity, unit, cost, date, notes } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Material name is required" }, { status: 400 });
  }
  const result = db
    .prepare(
      "INSERT INTO materials (name, quantity, unit, cost, date, notes) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      name.trim(),
      quantity ?? 1,
      unit || "pcs",
      parseFloat(cost) || 0,
      date || new Date().toISOString().split("T")[0],
      notes || ""
    );
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(material, { status: 201 });
}
