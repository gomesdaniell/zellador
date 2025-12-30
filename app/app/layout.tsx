import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import AppShell from "./_components/AppShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?next=/app/dashboard");
  }

  return <AppShell>{children}</AppShell>;
}
