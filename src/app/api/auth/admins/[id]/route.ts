export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, phone, email, password, role } = await request.json();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  if (name !== undefined) { updates.push("name = ?"); values.push(name.trim()); }
  if (phone !== undefined) { updates.push("phone = ?"); values.push(phone.trim()); }
  if (email !== undefined) { updates.push("email = ?"); values.push(email.trim()); }
  if (role !== undefined) { updates.push("role = ?"); values.push(role); }
  if (password) { updates.push("password_hash = ?"); values.push(hashPassword(password)); }
  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  values.push(id);
  await db.execute(`UPDATE admins SET ${updates.join(", ")} WHERE id = ?`, values);
  const { rows } = await db.execute("SELECT id, name, phone, email, role, created_at FROM admins WHERE id = ?", [id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.execute("DELETE FROM admins WHERE id = ? AND role != 'superadmin'", [id]);
  return NextResponse.json({ success: true });
}
