export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import db from "@/lib/db";

function parseNonNegativeNumber(value: unknown, fallback?: number) {
  if (value == null || value === "") return fallback ?? null;
  const parsed = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isValidDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const where: string[] = [];
  const params: string[] = [];

  if (from) {
    if (!isValidDate(from)) {
      return NextResponse.json({ error: "from must be a YYYY-MM-DD date" }, { status: 400 });
    }
    where.push("date >= ?");
    params.push(from);
  }
  if (to) {
    if (!isValidDate(to)) {
      return NextResponse.json({ error: "to must be a YYYY-MM-DD date" }, { status: 400 });
    }
    where.push("date <= ?");
    params.push(to);
  }
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  if (query) {
    const like = `%${query.trim()}%`;
    where.push("(name LIKE ? OR unit LIKE ? OR supplier LIKE ? OR notes LIKE ?)");
    params.push(like, like, like, like);
  }

  const sql = `SELECT * FROM materials${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY date DESC, id DESC`;
  const materials = db.prepare(sql).all(...params);
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const { name, quantity, unit, cost, date, category, supplier, notes } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Material name is required" }, { status: 400 });
  }
  const parsedQuantity = parseNonNegativeNumber(quantity, 1);
  if (parsedQuantity == null) {
    return NextResponse.json({ error: "Quantity must be a non-negative number" }, { status: 400 });
  }
  const parsedCost = parseNonNegativeNumber(cost, 0);
  if (parsedCost == null) {
    return NextResponse.json({ error: "Cost must be a non-negative number" }, { status: 400 });
  }
  const materialDate = date || new Date().toISOString().split("T")[0];
  if (!isValidDate(materialDate)) {
    return NextResponse.json({ error: "Date must be a YYYY-MM-DD date" }, { status: 400 });
  }
  const result = db
    .prepare(
      "INSERT INTO materials (name, quantity, unit, cost, date, category, supplier, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      name.trim(),
      parsedQuantity,
      unit || "pcs",
      parsedCost,
      materialDate,
      category?.trim() || "",
      supplier?.trim() || "",
      notes || ""
    );
  const material = db.prepare("SELECT * FROM materials WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(material, { status: 201 });
}
