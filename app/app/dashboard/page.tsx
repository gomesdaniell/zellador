import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, houses:house_id (id, name)")
    .eq("user_id", auth.user.id);

  const active = memberships?.[0]?.houses as any;

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Casa ativa: <strong>{active?.name ?? "—"}</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.12)" }}>
          <strong>Cadastros</strong>
          <p style={{ opacity: 0.8 }}>Em breve</p>
        </div>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.12)" }}>
          <strong>Calendário</strong>
          <p style={{ opacity: 0.8 }}>Em breve</p>
        </div>
        <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.12)" }}>
          <strong>Financeiro</strong>
          <p style={{ opacity: 0.8 }}>Em breve</p>
        </div>
      </div>
    </main>
  );
}
