import { requireUser } from "@/lib/supabase/guard";
import AppShell from "@/components/AppShell";

export default async function MaterialsPage() {
  await requireUser();
  return <AppShell initialTab="materials" />;
}
