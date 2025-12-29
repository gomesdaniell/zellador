"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }
    window.location.href = "/app/dashboard";
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Entrar</h1>
        <p className="muted">Acesse sua conta para gerenciar sua casa.</p>

        <form onSubmit={onLogin}>
          <div className="row">
            <label style={{ flex: 1, minWidth: 240 }}>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>

            <label style={{ flex: 1, minWidth: 240 }}>
              Senha
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
          </div>

          <div className="row" style={{ justifyContent: "flex-end", marginTop: 10 }}>
            <button className="primary" type="submit">Entrar</button>
          </div>

          {msg ? <p className="muted" style={{ color: "#b91c1c" }}>{msg}</p> : null}
        </form>

        <hr style={{ margin: "16px 0", borderColor: "var(--border)" }} />

        <p className="muted">
          Ainda não tem usuário? Crie no Supabase Auth (por enquanto) — depois a gente coloca “Criar conta” na UI.
        </p>
      </div>
    </main>
  );
}
