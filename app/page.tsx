export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 720, width: "100%", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Zellador</h1>
        <p style={{ marginTop: 10, color: "#374151", lineHeight: 1.5 }}>
          Página inicial no ar ✅
        </p>

        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #d1fae5" }}>
          <strong style={{ color: "#065f46" }}>Próximo passo:</strong>
          <div style={{ marginTop: 6, color: "#065f46" }}>
            Login + módulo financeiro (contas a pagar/receber) com Supabase.
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="https://zellador.com.br"
            style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, background: "#0f766e", color: "#fff" }}
          >
            Domínio (quando apontar)
          </a>
          <a
            href="https://zellador.vercel.app"
            style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", color: "#111827", background: "#fff" }}
          >
            URL Vercel
          </a>
        </div>
      </div>
    </main>
  );
}
