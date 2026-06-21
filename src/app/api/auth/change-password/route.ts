export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db, waitReady } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  await waitReady();
  const { adminId, currentPassword, newPassword } = await request.json();

  if (!adminId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "Admin ID, current password, and new password are required" }, { status: 400 });
  }

  if (newPassword.length < 4) {
    return NextResponse.json({ error: "New password must be at least 4 characters" }, { status: 400 });
  }

  const { rows } = await db.execute("SELECT * FROM admins WHERE id = ?", [adminId]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const admin = rows[0] as Record<string, unknown>;

  if (!verifyPassword(String(currentPassword), String(admin.password_hash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const hashed = hashPassword(newPassword);
  await db.execute("UPDATE admins SET password_hash = ? WHERE id = ?", [hashed, adminId]);

  return NextResponse.json({ success: true, message: "Password changed successfully" });
}
