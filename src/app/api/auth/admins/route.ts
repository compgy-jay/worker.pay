export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const { rows } = await db.execute(
    "SELECT id, name, phone, email, role, created_at FROM admins ORDER BY created_at DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const { name, phone, email, password, role } = await request.json();
  if (!password || password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }
  const hashed = hashPassword(password);
  const result = await db.execute(
    `INSERT INTO admins (name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [name?.trim() || "", phone?.trim() || "", email?.trim() || "", hashed, role || "admin"]
  );
  const { rows } = await db.execute("SELECT id, name, phone, email, role, created_at FROM admins WHERE id = ?", [Number(result.lastInsertRowid!)]);
  return NextResponse.json(rows[0], { status: 201 });
}
