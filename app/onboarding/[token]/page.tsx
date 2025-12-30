"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "loading") return <p style={{ padding: 40 }}>Validando convite...</p>;
  if (state === "error") return <p style={{ padding: 40 }}>Convite inválido ou expirado.</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Convite válido</h1>
      <p>Você pode continuar o cadastro.</p>
    </div>
  );
}
