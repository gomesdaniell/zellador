"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Invite = {
  id: string;
  token: string;
  house_id: string;
  role: string;
  expires_at: string | null;
  used_at: string | null;
};

export default function InviteOnboardingPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    async function loadInvite() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/invite/${encodeURIComponent(token)}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Convite não encontrado.");
          }
          throw new Error(json?.error || "Erro ao validar convite.");
        }

        const inv: Invite = json.invite;

        if (inv.used_at) {
          throw new Error("Este convite já foi utilizado.");
        }

        if (inv.expires_at && new Date(inv.expires_at).getTime() < Date.now()) {
          throw new Error("Este convite expirou.");
        }

        setInvite(inv);
      } catch (e: any) {
        setInvite(null);
        setError(e?.message ?? "Erro ao carregar convite.");
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [token]);

  if (loading) {
    return (
      <main style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
        <h1>Validando convite...</h1>
        <p>Aguarde um momento.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
        <h1>Erro no convite</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!invite) {
    return (
      <main style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
        <h1>Convite inválido</h1>
        <p>Não foi possível localizar este convite.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 640, margin: "0 auto" }}>
      <h1>Você foi convidado 🎉</h1>

      <p style={{ opacity: 0.85 }}>
        Você recebeu um convite para entrar em um terreiro no Zellador com o
        papel <strong>{invite.role}</strong>.
      </p>

      <button
        onClick={() => router.push("/login")}
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 12,
          fontWeight: 900,
          border: "1px solid rgba(255,255,255,.15)",
          background: "rgba(255,255,255,.10)",
          cursor: "pointer",
        }}
      >
        Continuar para login / cadastro
      </button>

      <div style={{ marginTop: 24, opacity: 0.5 }}>
        <small>
          Código do convite: <code>{invite.token}</code>
        </small>
      </div>
    </main>
  );
}
