export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function requireAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const { name, contact, department } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  await db.execute(
    "UPDATE workers SET name = ?, contact = ?, department = ? WHERE id = ?",
    [name.trim(), contact?.trim() || "", department?.trim() || "", id]
  );
  const { rows } = await db.execute("SELECT * FROM workers WHERE id = ?", [id]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const result = await db.execute("DELETE FROM workers WHERE id = ?", [id]);
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
