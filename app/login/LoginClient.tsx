"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isValidEmail(email.trim()) && password.length >= 6;
  }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.push(next);
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword() {
    setMsg(null);
    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/login`,
      });

      if (error) throw error;

      setMsg("Se o e-mail estiver correto, você receberá um link para redefinir a senha.");
    } catch (err: any) {
      setMsg(err?.message ?? "Não foi possível enviar o e-mail de redefinição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup">
      <div className="container signup__grid">
        <section className="signup__copy">
          <p className="pill">Acesso do dirigente e equipe</p>
          <h1>
            Entrar no <span className="accent">Zellador</span>
          </h1>
          <p className="lead">
            Use seu e-mail e senha para acessar sua casa.
          </p>

          <p style={{ marginTop: 18, opacity: 0.85 }}>
            Ainda não tem conta?{" "}
            <Link href="/signup" style={{ textDecoration: "underline" }}>
              Criar conta
            </Link>
          </p>
        </section>

        <aside className="signup__card">
          <h2>Login</h2>

          <form onSubmit={onSubmit} className="signup__form">
            <label>
              <span>E-mail</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
              />
            </label>

            <label>
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                required
              />
            </label>

            {msg && <div className="signup__msg">{msg}</div>}

            <button className="btn btn--primary" disabled={!canSubmit || loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              className="btn"
              disabled={loading || !isValidEmail(email.trim())}
              onClick={onResetPassword}
              style={{ marginTop: 10 }}
            >
              Esqueci minha senha
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
