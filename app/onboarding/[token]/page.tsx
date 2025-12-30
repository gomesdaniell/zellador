"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();

  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/invite/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [token]);

  function goSignup() {
    router.push(`/signup?invite=${encodeURIComponent(String(token))}`);
  }

  function goLogin() {
    router.push(`/login?invite=${encodeURIComponent(String(token))}`);
  }

  if (state === "loading") return <p style={{ padding: 40 }}>Validando convite...</p>;
  if (state === "error") return <p style={{ padding: 40 }}>Convite inválido ou expirado.</p>;

  return (
    <div style={{ padding: 40, maxWidth: 640 }}>
      <h1 style={{ marginBottom: 8 }}>Convite válido</h1>
      <p style={{ opacity: 0.85, marginTop: 0 }}>
        Você pode continuar o cadastro.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button
          onClick={goSignup}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.12)",
            cursor: "pointer",
          }}
        >
          Continuar cadastro
        </button>

        <button
          onClick={goLogin}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,.12)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Já tenho conta
        </button>
      </div>

      <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
        Token: <span style={{ fontFamily: "monospace" }}>{token}</span>
      </div>
    </div>
  );
}
