import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="muted">Bem-vindo! (base pronta: shell + auth + rotas)</p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>Usuário logado</div>
        <div className="muted">{data.user?.email}</div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>Próximo passo</div>
        <div className="muted">
          Conectar esta área à sua House (seleção automática) e ligar o módulo de Mensalidades ao seu house_id.
        </div>
      </div>
    </div>
  );
}
