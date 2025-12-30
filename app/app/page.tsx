import Link from "next/link";

export default function AppPage() {
  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Bem-vindo ao Zellador</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Próximo passo: criar a sua casa para começar a usar a plataforma.
      </p>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/app/onboarding"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(255,255,255,.10)",
            border: "1px solid rgba(255,255,255,.15)",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Criar minha casa
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            background: "transparent",
            border: "1px solid rgba(255,255,255,.10)",
            fontWeight: 800,
            textDecoration: "none",
            opacity: 0.9,
          }}
        >
          Voltar pra landing
        </Link>
      </div>
    </main>
  );
}
