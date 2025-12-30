import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login?next=/app/dashboard");

  // 1) tenta ler casa ativa
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("active_house_id")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profErr) {
    // se der algum erro de schema/rls, melhor mostrar algo claro na UI
    // mas por enquanto, redireciona pro onboarding
    redirect("/app/onboarding");
  }

  let activeHouseId: string | null = prof?.active_house_id ?? null;

  // 2) se não tiver casa ativa, pega a primeira casa do usuário (qualquer uma)
  if (!activeHouseId) {
    const { data: firstMembership, error: memErr } = await supabase
      .from("house_users")
      .select("house_id")
      .eq("user_id", auth.user.id)
      .limit(1)
      .maybeSingle();

    if (memErr) {
      redirect("/app/onboarding");
    }

    activeHouseId = firstMembership?.house_id ?? null;

    // Se ainda não tem, é porque o usuário não participa de nenhuma casa
    if (!activeHouseId) {
      redirect("/app/onboarding");
    }

    // salva como ativa
    await supabase
      .from("profiles")
      .upsert({ id: auth.user.id, active_house_id: activeHouseId }, { onConflict: "id" });
  }

  // 3) carrega dados da casa ativa
  const { data: house, error: houseErr } = await supabase
    .from("houses")
    .select("id, name, slug")
    .eq("id", activeHouseId)
    .maybeSingle();

  // Se a casa ativa não existir (apagada), volta pro onboarding
  if (houseErr || !house) {
    await supabase
      .from("profiles")
      .upsert({ id: auth.user.id, active_house_id: null }, { onConflict: "id" });

    redirect("/app/onboarding");
  }

  const houseName = house?.name ?? "—";

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>Dashboard</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Casa ativa: <b>{houseName}</b>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div
          style={{
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20 }}>Cadastros</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20 }}>Calendário</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.04)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20 }}>Financeiro</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>Em breve</div>
        </div>
      </div>
    </main>
  );
}
