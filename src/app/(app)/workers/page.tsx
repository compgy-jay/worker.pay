import { requireUser } from "@/lib/supabase/guard";
import AppShell from "@/components/AppShell";

export default async function WorkersPage() {
  await requireUser();
  return <AppShell initialTab="workers" />;
}
