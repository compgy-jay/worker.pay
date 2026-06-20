export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }
  const { rows } = await db.execute("SELECT * FROM admins WHERE role = 'superadmin' LIMIT 1");
  if (rows.length === 0) {
    return NextResponse.json({ error: "No admin configured" }, { status: 500 });
  }
  const admin = rows[0] as Record<string, unknown>;
  if (!verifyPassword(String(password), String(admin.password_hash))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = createToken({ id: admin.id, role: admin.role });
  return NextResponse.json({
    token,
    admin: { id: admin.id, name: admin.name, phone: admin.phone, email: admin.email, role: admin.role },
  });
}
