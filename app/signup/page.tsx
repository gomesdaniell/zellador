"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";


function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/app";

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
    if (!canSubmit) return;

    setMsg(null);
    setLoading(true);

    try {
      // 1) cria conta
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2) tenta logar na sequência (caso o projeto não exija confirmação por e-mail)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // Se exigir confirmação por e-mail, aqui geralmente falha.
        setMsg(
          "Conta criada! Verifique seu e-mail para confirmar o acesso. Assim que confirmar, volte e faça login."
        );
        return;
      }

      // 3) salva “nome da casa” em localStorage para pré-preencher o onboarding
      try {
        localStorage.setItem("zellador_pref_house_name", houseName.trim());
      } catch {}

      router.push(next);
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao criar conta.");
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
            Coloque sua casa em ordem em poucos dias —
            <span className="accent"> sem planilhas</span>.
          </h1>
          <p className="lead">
            Crie sua conta, cadastre a casa e comece pelo básico: cadastros, calendário e visão do financeiro do mês.
            Depois você convida outras pessoas e define permissões.
          </p>

          <div className="signup__bullets">
            <div className="bullet">
              <strong>Simples e intuitivo</strong>
              <span>feito pra funcionar bem no celular.</span>
            </div>
            <div className="bullet">
              <strong>Controle de acesso</strong>
              <span>quem sai, perde acesso — sem trocar link.</span>
            </div>
            <div className="bullet">
              <strong>30 dias pra sentir</strong>
              <span>se não fizer sentido, você para.</span>
            </div>
            <div className="bullet">
              <strong>Histórico e continuidade</strong>
              <span>tudo centralizado e organizado.</span>
            </div>
          </div>
        </section>

        <aside className="signup__card">
          <h2>Criar conta</h2>
          <p className="muted" style={{ marginTop: 6 }}>
            Sem compromisso. Você começa agora e decide depois.
          </p>

          <form onSubmit={onSubmit} className="signup__form">
            <label>
              <span>Seu nome</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Daniel Gomes"
                autoComplete="name"
                required
              />
            </label>

            <label>
              <span>Nome da casa</span>
              <input
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="Ex: Filhos do Sagrado"
                required
              />
            </label>

            <label>
              <span>E-mail</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>Senha</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            {msg && <div className="signup__msg">{msg}</div>}

            <button className="btn btn--primary" disabled={!canSubmit || loading}>
              {loading ? "Criando..." : "Começar 30 dias grátis"}
            </button>

            <div className="signup__links">
              <a className="btn btn--ghost" href="/login">
                Já tenho conta
              </a>
              <a className="btn btn--ghost" href="/">
                Voltar pra landing
              </a>
            </div>

            <small className="muted">
              Ao criar a conta, você concorda com os termos e a política de privacidade (pode colocar depois).
            </small>
          </form>
        </aside>
      </div>
    </main>
  );
}
