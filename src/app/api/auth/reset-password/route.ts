export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { phone, newPassword } = await request.json();
  if (!phone || !newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: "Phone and new password (min 4 chars) are required" }, { status: 400 });
  }
  const { rows } = await db.execute("SELECT * FROM admins WHERE phone = ?", [phone.trim()]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No admin found with that phone number" }, { status: 404 });
  }
  const hashed = hashPassword(newPassword);
  await db.execute("UPDATE admins SET password_hash = ? WHERE phone = ?", [hashed, phone.trim()]);
  return NextResponse.json({ success: true, message: "Password reset successfully" });
}
