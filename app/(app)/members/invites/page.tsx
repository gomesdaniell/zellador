"use client";

import { useEffect, useMemo, useState } from "react";

type InviteRole = "medium" | "consulente";

type Invite = {
  id: string;
  token: string;
  role: InviteRole;
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
};

export default function MembersInvitesPage() {
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);

  const [list, setList] = useState<Invite[]>([]);
  const [q, setQ] = useState("");

  const [role, setRole] = useState<InviteRole>("medium");
  const [expiryDays, setExpiryDays] = useState<string>("7");

  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 NOVO: guarda o último link criado
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  /* =========================
     HOUSE ATIVA (MVP)
  ========================== */
  useEffect(() => {
    fetch("/api/me/house")
      .then((r) => r.json())
      .then((d) => setActiveHouseId(d.house_id))
      .catch(() => setActiveHouseId(null));
  }, []);

  /* =========================
     TOAST
  ========================== */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  /* =========================
     LOAD INVITES
  ========================== */
  async function loadInvites() {
    const res = await fetch("/api/invites");
    const json = await res.json();
    setList(json.invites ?? []);
  }

  useEffect(() => {
    loadInvites();
  }, []);

  /* =========================
     FILTER
  ========================== */
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;

    return list.filter((inv) =>
      `${inv.token} ${inv.role}`.toLowerCase().includes(t)
    );
  }, [q, list]);

  /* =========================
     CREATE INVITE
  ========================== */
  async function createInvite() {
    if (!activeHouseId) {
      showToast("Casa ativa não encontrada");
      return;
    }

    setLoading(true);

    const days = expiryDays === "never" ? null : Number(expiryDays);

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        house_id: activeHouseId,
        role,
        days,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      showToast(json?.error || "Erro ao criar convite");
      return;
    }

    // 🔹 NOVO: salva o link retornado pela API
    setLastInviteLink(json.link);

    showToast("Convite criado!");
    loadInvites();
  }

  /* =========================
     LINKS
  ========================== */
  function inviteLink(token: string) {
    return `${window.location.origin}/onboarding/${token}`;
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(inviteLink(token));
    showToast("Link copiado!");
  }

  function openWhatsApp(token: string) {
    const msg =
      `Olá! Segue seu link para cadastro no Zellador:\n\n` +
      `➡️ ${inviteLink(token)}\n\n` +
      `Qualquer dúvida, me chama por aqui.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="page">
      <h1>Convites</h1>

      {toast && <div className="toast">{toast}</div>}

      <div className="panel">
        <h2>Criar convite</h2>

        <select value={role} onChange={(e) => setRole(e.target.value as InviteRole)}>
          <option value="medium">Médium</option>
          <option value="consulente">Consulente</option>
        </select>

        <select value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}>
          <option value="7">7 dias</option>
          <option value="15">15 dias</option>
          <option value="30">30 dias</option>
          <option value="never">Sem expiração</option>
        </select>

        <button disabled={loading} onClick={createInvite}>
          {loading ? "Gerando..." : "Gerar link"}
        </button>
      </div>

      {/* 🔹 NOVO: bloco para copiar link recém-criado */}
      {lastInviteLink && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ wordBreak: "break-all" }}>{lastInviteLink}</span>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(lastInviteLink);
              showToast("Link copiado!");
            }}
          >
            Copiar
          </button>
        </div>
      )}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por token ou tipo…"
      />

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Token</th>
            <th>Status</th>
            <th>Expira</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((inv) => {
            const status = inv.used_at
              ? "Usado"
              : inv.expires_at && new Date(inv.expires_at) < new Date()
              ? "Expirado"
              : "Ativo";

            return (
              <tr key={inv.id}>
                <td>{inv.role === "medium" ? "Médium" : "Consulente"}</td>
                <td>{inv.token}</td>
                <td>{status}</td>
                <td>
                  {inv.expires_at
                    ? new Date(inv.expires_at).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <button onClick={() => copyLink(inv.token)}>Copiar</button>
                  <button onClick={() => openWhatsApp(inv.token)}>WhatsApp</button>
                  <a href={inviteLink(inv.token)} target="_blank">
                    Abrir
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
