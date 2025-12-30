import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import SwitchHouseClient from "./SwitchHouseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HousesPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login?next=/app/houses");

  // casa ativa atual
  const { data: prof } = await supabase
    .from("profiles")
    .select("active_house_id")
    .eq("id", auth.user.id)
    .maybeSingle();

  const activeHouseId = prof?.active_house_id ?? null;

  // lista casas do usuário via house_users
  const { data: memberships, error: memErr } = await supabase
    .from("house_users")
    .select("role, houses:id ( id, name, slug )")
    .eq("user_id", auth.user.id);

  if (memErr) {
    return (
      <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 54, margin: 0 }}>Minhas Casas</h1>
        <p style={{ opacity: 0.8, marginTop: 10 }}>
          Erro ao carregar casas: <b>{memErr.message}</b>
        </p>
      </main>
    );
  }

  const houses =
    (memberships || [])
      .map((m: any) => ({
        role: m.role,
        id: m.houses?.id as string | undefined,
        name: m.houses?.name as string | undefined,
        slug: m.houses?.slug as string | undefined,
      }))
      .filter((h) => !!h.id && !!h.name);

  if (!houses.length) {
    redirect("/app/onboarding");
  }

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 54, margin: 0 }}>Minhas Casas</h1>
          <p style={{ opacity: 0.8, marginTop: 10 }}>
            Selecione qual casa você quer usar agora.
          </p>
        </div>

        <a
          href="/app/dashboard"
          style={{ opacity: 0.9, textDecoration: "underline" }}
        >
          Voltar ao Dashboard
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 24 }}>
        {houses.map((h) => {
          const isActive = activeHouseId === h.id;

          return (
            <div
              key={h.id}
              style={{
                padding: 18,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22 }}>{h.name}</div>
                  <div style={{ opacity: 0.75, marginTop: 6 }}>
                    Slug: <b>{h.slug}</b> • Papel: <b>{String(h.role || "—")}</b>
                  </div>
                  {isActive && (
                    <div style={{ marginTop: 10, display: "inline-flex", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(45,212,191,.35)", background: "rgba(45,212,191,.12)", fontWeight: 800 }}>
                      Casa ativa
                    </div>
                  )}
                </div>

                <SwitchHouseClient houseId={h.id} disabled={isActive} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
