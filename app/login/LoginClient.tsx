"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

export default function LoginClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const n = searchParams?.get("next");
    // segurança: só permite redirect interno
    if (!n || !n.startsWith("/")) return "/app/dashboard";
    return n;
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Se já estiver logado, manda direto
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.replace(nextUrl);
        router.refresh();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mensagens mais úteis pro usuário
        const m = (error.message || "").toLowerCase();

        if (m.includes("invalid login") || m.includes("invalid") || m.includes("credentials")) {
          throw new Error("E-mail ou senha incorretos.");
        }

        if (m.includes("email not confirmed")) {
          throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
        }

        throw new Error(error.message);
      }

      // garante sessão carregada
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        throw new Error("Login realizado, mas sessão não foi carregada. Atualize a página.");
      }

      router.replace(nextUrl);
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", fontSize: 12 }}>
            Acesso do dirigente e equipe
          </div>
          <h1 style={{ fontSize: 64, margin: "14px 0 10px" }}>
            Entrar no <span style={{ color: "#2dd4bf" }}>Zellador</span>
          </h1>
          <p style={{ opacity: 0.8, marginTop: 0, maxWidth: 520 }}>
            Use seu e-mail e senha para acessar sua casa.
          </p>

          <p style={{ opacity: 0.9, marginTop: 18 }}>
            Ainda não tem conta?{" "}
            <a href="/signup" style={{ textDecoration: "underline", color: "inherit" }}>
              Criar conta
            </a>
          </p>
        </div>

        <div style={{ padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
          <h2 style={{ margin: "6px 0 14px", fontSize: 28 }}>Login</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 700, opacity: 0.9 }}>E-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              type="email"
              required
              autoComplete="email"
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.04)",
                color: "inherit",
              }}
            />

            <label style={{ fontWeight: 700, opacity: 0.9, marginTop: 6 }}>Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              type="password"
              minLength={6}
              required
              autoComplete="current-password"
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.04)",
                color: "inherit",
              }}
            />

            {msg && (
              <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,.06)", marginTop: 8 }}>
                {msg}
              </div>
            )}

            <button
              disabled={loading}
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                fontWeight: 900,
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(45,212,191,.20)",
                cursor: "pointer",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              disabled
              style={{
                marginTop: 6,
                padding: 12,
                borderRadius: 12,
                fontWeight: 800,
                border: "1px solid rgba(255,255,255,.10)",
                background: "rgba(255,255,255,.06)",
                opacity: 0.5,
                cursor: "not-allowed",
              }}
              title="Vamos habilitar depois"
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
