import { requireUser } from "@/lib/supabase/guard";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  await requireUser();
  return <AppShell initialTab="dashboard" />;
}
