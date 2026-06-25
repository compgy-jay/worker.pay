import { requireUser } from "@/lib/supabase/guard";
import AppShell from "@/components/AppShell";

export default async function WagesPage() {
  await requireUser();
  return <AppShell initialTab="wages" />;
}
