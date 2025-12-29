export default function Sidebar() {
  return (
    <aside
      className="card"
      style={{
        width: 260,
        padding: 14,
        position: "sticky",
        top: 18,
        height: "calc(100vh - 36px)",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16 }}>Zellador</div>
      <div className="muted" style={{ marginTop: 6 }}>Painel da Casa</div>

      <hr style={{ margin: "14px 0", borderColor: "var(--border)" }} />

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a href="/app/dashboard"><button style={{ width: "100%" }}>Dashboard</button></a>
        <div className="muted" style={{ marginTop: 8 }}>Financeiro</div>
        <a href="/app/financeiro/mensalidades"><button style={{ width: "100%" }}>Mensalidades</button></a>
      </nav>
    </aside>
  );
}
