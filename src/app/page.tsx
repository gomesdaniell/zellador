export default function LandingPage() {
  return (
    <main className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Zellador</h1>
        <p className="muted">
          Um SaaS para organizar o financeiro e a rotina de casas/terreiros — com segurança (Auth + RLS) e clareza.
        </p>

        <div className="row" style={{ alignItems: "center" }}>
          <a href="/login">
            <button className="primary">Entrar</button>
          </a>
          <a href="/login">
            <button>Criar / Acessar conta</button>
          </a>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "var(--border)" }} />

        <div className="row" style={{ alignItems: "stretch" }}>
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0 }}>Mensalidades</h3>
            <p className="muted">Recorrência, pagamentos parciais, atrasos e visão do mês.</p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0 }}>Entradas avulsas</h3>
            <p className="muted">Doações, lojinha, eventos e outras receitas.</p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ marginTop: 0 }}>Transparência</h3>
            <p className="muted">Relatórios claros para prestação de contas (sem expor dados sensíveis).</p>
          </div>
        </div>
      </div>
    </main>
  );
}
