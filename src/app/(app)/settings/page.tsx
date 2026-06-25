import { requireUser } from "@/lib/supabase/guard";
import AppShell from "@/components/AppShell";

export default async function SettingsPage() {
  await requireUser();
  return <AppShell initialTab="settings" />;
}
