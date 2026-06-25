import { createAdminClient } from "@/lib/supabase/admin";

export type Role = "project_manager" | "foreman" | "viewer";

export async function getUserRole(userId: string): Promise<Role | null> {
  try {
    const supabase = createAdminClient();
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    return (user?.user?.user_metadata?.role as Role) ?? "viewer";
  } catch {
    return null;
  }
}

export async function requireRole(
  userId: string,
  allowedRoles: Role[]
): Promise<boolean> {
  const role = await getUserRole(userId);
  return role !== null && allowedRoles.includes(role);
}
