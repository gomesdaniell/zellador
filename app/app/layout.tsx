import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";

// evita cache e garante leitura correta de cookies/sessão
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    // manda pro login e volta para /app/onboarding depois
    redirect("/login?next=/app/onboarding");
  }

  return <>{children}</>;
}
