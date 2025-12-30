"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/app/_lib/supabaseBrowser";

type Invite = {
  id: string;
  token: string;
  house_id: string;
  role: "medium" | "consulente";
  expires_at: string | null;
  used_at: string | null;
};

export default function OnboardingTokenPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = String(params.token || "");

  const sb = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptLgpd, setAcceptLgpd] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data, error } = await sb
        .from("invites")
        .select("id, token, house_id, role, expires_at, used_at")
        .eq("token", token)
        .maybeSingle();

      if (error) {
        setErr("Erro ao validar convite.");
        setInvite(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setErr("Convite não encontrado.");
        setInvite(null);
        setLoading(false);
        return;
      }

      // valida expiração e uso
      const used = !!data.used_at;
      const expired = data.expires_at ? new Date(data.expires_at).getTime() < Date.now() : false;

      if (used) {
        setErr("Este convite já foi utilizado.");
        setInvite(null);
        setLoading(false);
        return;
      }
      if (expired) {
        setErr("Este convite expirou.");
        setInvite(null);
        setLoading(false);
        return;
      }

      setInvite(data as Invite);
      setLoading(false);
    })();
  }, [sb, token]);

  async function handleSubmit() {
    if (!invite) return;
    setErr(null);

    if (!name.trim()) return setErr("Informe seu nome.");
    if (!email.trim()) return setErr("Informe seu e-mail.");
    if (password.length < 6) return setErr("A senha deve ter pelo menos 6 caracteres.");
    if (!acceptRules) return setErr("Você precisa aceitar as regras da casa.");
    if (!acceptLgpd) return setErr("Você precisa concordar com o uso dos dados (LGPD).");

    setLoading(true);

    // 1) cria conta
    const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpErr || !signUpData.user) {
      setErr(signUpErr?.message || "Falha ao criar usuário.");
      setLoading(false);
      return;
    }

    const userId = signUpData.user.id;

    // 2) garante perfil (muitos projetos já criam por trigger)
    // Vamos fazer UPSERT para não depender de trigger.
    const { error: profErr } = await sb.from("profiles").upsert(
      {
        id: userId,
        active_house_id: invite.house_id,
        access_level: "USER",
      },
      { onConflict: "id" }
    );

    if (profErr) {
      setErr("Usuário criado, mas falhou ao configurar perfil.");
      setLoading(false);
      return;
    }

    // 3) cria member
    const { error: memErr } = await sb.from("members").insert({
      house_id: invite.house_id,
      user_id: userId,
      role: invite.role,
      name,
      whatsapp,
      email,
      active: true,
      consents: {
        rules: true,
        lgpd: true,
        created_from: "invite",
        invite_id: invite.id,
      },
    });

    if (memErr) {
      setErr("Perfil criado, mas falhou ao salvar cadastro.");
      setLoading(false);
      return;
    }

    // 4) marca convite como usado
    const { error: invErr } = await sb
      .from("invites")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (invErr) {
      // não bloqueia o usuário por isso no MVP
      console.warn("Falha ao marcar convite como usado:", invErr);
    }

    // 5) entra (se email confirmation estiver OFF, a sessão já existe)
    // se por algum motivo não logar, forçamos o login:
    const { data: sessionNow } = await sb.auth.getSession();
    if (!sessionNow.session) {
      await sb.auth.signInWithPassword({ email, password });
    }

    setLoading(false);
    router.replace("/dashboard");
  }

  if (loading) {
    return (
      <div className="card">
        <h1>Cadastro no Terreiro</h1>
        <p>Carregando convite...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="card">
        <h1>Cadastro no Terreiro</h1>
        <p style={{ opacity: 0.9 }}>{err}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: "40px auto" }}>
      <h1 style={{ fontSize: 44, marginBottom: 6 }}>Cadastro no Terreiro</h1>
      <p style={{ opacity: 0.85, marginBottom: 20 }}>
        Você está se cadastrando como <b>{invite?.role === "medium" ? "Médium" : "Consulente"}</b>.
      </p>

      <div className="grid2">
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
        </label>

        <label>
          WhatsApp (opcional)
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(92) 9xxxx-xxxx" />
        </label>

        <label>
          E-mail (login)
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
        </label>

        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6" />
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <input type="checkbox" checked={acceptRules} onChange={(e) => setAcceptRules(e.target.checked)} />
          Li e concordo com as regras da casa
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={acceptLgpd} onChange={(e) => setAcceptLgpd(e.target.checked)} />
          Concordo com o uso dos dados (LGPD)
        </label>
      </div>

      {err && <p style={{ marginTop: 14 }}>{err}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          Criar conta e entrar
        </button>
      </div>
    </div>
  );
}
