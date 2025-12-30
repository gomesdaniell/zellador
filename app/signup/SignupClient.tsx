"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ AQUI É O PULO DO GATO: o parâmetro é "invite"
  const inviteToken = searchParams.get("invite");
  const next = "/app/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 1️⃣ VALIDA CONVITE
  useEffect(() => {
    if (!inviteToken) {
      setMsg("Convite inválido.");
      return;
    }

    setMsg(null);
    fetch(`/api/invite/${inviteToken}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setInvite(data))
      .catch(() => setMsg("Convite inválido ou expirado."));
  }, [inviteToken]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email.trim()) &&
      password.length >= 6 &&
      !!invite &&
      !!inviteToken
    );
  }, [fullName, email, password, invite, inviteToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setMsg(null);

    try {
      const emailNorm = email.trim().toLowerCase();
      const fullNameNorm = fullName.trim();

      // 2️⃣ CRIA USUÁRIO
      const { error: signUpError } = await supabase.auth.signUp({
        email: emailNorm,
        password,
        options: { data: { full_name: fullNameNorm } },
      });
      if (signUpError) throw signUpError;

      // 3️⃣ LOGIN
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password,
      });
      if (loginError) throw loginError;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Usuário não autenticado.");

      // 4️⃣ PROFILE (se existir)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          active_house_id: invite.house_id,
        },
        { onConflict: "id" }
      );

      // 5️⃣ MEMBERSHIP (evita duplicar se já existir)
      const { data: existing } = await supabase
        .from("house_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("house_id", invite.house_id)
        .maybeSingle();

      if (!existing) {
        const { error: memberErr } = await supabase.from("house_users").insert({
          user_id: user.id,
          house_id: invite.house_id,
          role: invite.role,
        });
        if (memberErr) throw memberErr;
      }

      // 6️⃣ MARCA CONVITE COMO USADO (se ainda não foi)
      await supabase
        .from("invites")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invite.id)
        .is("used_at", null);

      router.replace(next);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  if (msg && !invite) {
    return <div style={{ padding: 40 }}>{msg}</div>;
  }

  return (
    <main style={{ padding: 40, maxWidth: 520 }}>
      <h2 style={{ marginBottom: 6 }}>Criar conta</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        Preencha seus dados para concluir o cadastro.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Seu nome</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {msg && (
          <div style={{ padding: 10, borderRadius: 12, background: "rgba(255,255,255,.06)" }}>
            {msg}
          </div>
        )}

        <button
          disabled={!canSubmit || loading}
          style={{
            padding: 12,
            borderRadius: 12,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.10)",
            cursor: "pointer",
          }}
        >
          {loading ? "Criando..." : "Concluir cadastro"}
        </button>
      </form>
    </main>
  );
}
