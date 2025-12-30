"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const pref = localStorage.getItem("zellador_pref_house_name");
      if (pref) setName(pref);
    } catch {}
  }, []);

  async function createHouse(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Você precisa estar logado. Faça login novamente.");
        }
        throw new Error(json?.error || "Erro ao criar a casa.");
      }

      router.push("/app/dashboard");
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao criar a casa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Criar sua Casa</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Isso cria o ambiente do seu terreiro. Depois você convida pessoas e define permissões.
      </p>

      <form onSubmit={createHouse} style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da casa"
          required
          style={{
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.04)",
            color: "inherit",
          }}
        />

        {msg && (
          <div style={{ padding: 10, borderRadius: 12, background: "rgba(255,255,255,.06)" }}>
            {msg}
          </div>
        )}

        <button
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.10)",
            cursor: "pointer",
          }}
        >
          {loading ? "Criando..." : "Criar casa e continuar"}
        </button>
      </form>
    </main>
  );
}
