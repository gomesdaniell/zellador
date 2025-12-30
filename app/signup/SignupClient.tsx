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

  const token = searchParams.get("token"); // 👈 VEM DO LINK
  const next = "/app/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 1️⃣ VALIDA CONVITE
  useEffect(() => {
    if (!token) {
      setMsg("Convite inválido.");
      return;
    }

    fetch(`/api/invite/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setInvite(data))
      .catch(() => setMsg("Convite inválido ou expirado."));
  }, [token]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      isValidEmail(email.trim()) &&
      password.length >= 6 &&
      !!invite
    );
  }, [fullName, email, password, invite]);

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
        options: {
          data: { full_name: fullNameNorm },
        },
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

      // 4️⃣ PROFILE
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          active_house_id: invite.house_id,
        },
        { onConflict: "id" }
      );

      // 5️⃣ VINCULA USUÁRIO À CASA
      await supabase.from("house_members").insert({
        user_id: user.id,
        house_id: invite.house_id,
        role: invite.role,
      });

      // 6️⃣ MARCA CONVITE COMO USADO
      await supabase
        .from("invites")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invite.id);

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
    <main className="signup">
      <div className="container signup__grid">
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
              {loading ? "Criando..." : "Concluir cadastro"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
