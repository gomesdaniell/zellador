import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  // 1) tenta ler casa ativa
  const { data: prof } = await supabase
    .from("profiles")
    .select("active_house_id")
    .eq("id", auth.user.id)
    .maybeSingle();

  let activeHouseId = prof?.active_house_id ?? null;

  // 2) se não tiver, pega a primeira casa do usuário
  if (!activeHouseId) {
    const { data: firstMembership } = await supabase
      .from("house_users")
      .select("house_id")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    activeHouseId = firstMembership?.house_id ?? null;

    // salva como ativa
    if (activeHouseId) {
      await supabase
        .from("profiles")
        .upsert({ id: auth.user.id, active_house_id: activeHouseId }, { onConflict: "id" });
    }
  }

  // 3) carrega dados da casa ativa
  let houseName = "—";
  if (activeHouseId) {
    const { data: house } = await supabase
      .from("houses")
      .select("name")
      .eq("id", activeHouseId)
      .single();

    houseName = house?.name ?? "—";
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>Dashboard</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Casa ativa: <b>{houseName}</b>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 24 }}>
        <div style={{ padding: 18, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Cadastros</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>
        <div style={{ padding: 18, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Calendário</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>
        <div style={{ padding: 18, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>Financeiro</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>
      </div>
    </main>
  );
}
