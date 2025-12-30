"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/app/dashboard";

  const [fullName, setFullName] = useState("");
  const [houseName, setHouseName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      houseName.trim().length >= 2 &&
      isValidEmail(email.trim()) &&
      password.length >= 6
    );
  }, [fullName, houseName, email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setMsg(null);
    setLoading(true);

    try {
      const emailNorm = email.trim().toLowerCase();
      const fullNameNorm = fullName.trim();
      const houseNameNorm = houseName.trim();

      // 1) CRIA USUÁRIO
      const { error: signUpError } = await supabase.auth.signUp({
        email: emailNorm,
        password,
        options: {
          data: { full_name: fullNameNorm },
        },
      });
      if (signUpError) throw signUpError;

      // 2) GARANTE LOGIN (sessão)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password,
      });
      if (loginError) throw loginError;

      // 3) GARANTE PROFILE (base para casa ativa e preferências)
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        throw new Error("Conta criada, mas sessão não foi carregada. Atualize a página.");
      }

      // Upsert no profiles (ajuste colunas conforme seu schema)
      // Se seu profiles só tiver (id, active_house_id, created_at, updated_at), pode deixar só { id: user.id }
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id }, { onConflict: "id" });

      if (profErr) throw profErr;

      // 4) CRIA A CASA (SERVER → respeita RLS e deve setar active_house_id)
      const resp = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: houseNameNorm }),
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(json?.error || "Erro ao criar a casa.");
      }

      // 5) ENTRA NO APP
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      console.error("SIGNUP ERROR =>", err);
      setMsg(
        typeof err?.message === "string"
          ? err.message
          : JSON.stringify(err, null, 2)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup">
      <div className="container signup__grid">
        <section className="signup__copy">
          <p className="pill">Experimente grátis por 30 dias • sem compromisso</p>
          <h1>
            Comece agora — <span className="accent">simples e intuitivo</span>.
          </h1>
          <p className="lead">
            Crie sua conta, cadastre a casa e comece pelo básico.
          </p>
        </section>

        <aside className="signup__card">
          <h2>Criar conta</h2>

          <form onSubmit={onSubmit} className="signup__form">
            <label>
              <span>Seu nome</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Nome da casa</span>
              <input
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                required
              />
            </label>

            <label>
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {msg && <div className="signup__msg">{msg}</div>}

            <button className="btn btn--primary" disabled={!canSubmit || loading}>
              {loading ? "Criando..." : "Começar 30 dias grátis"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
