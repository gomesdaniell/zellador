"use client";

import { useEffect, useMemo, useState } from "react";

type InviteRole = "medium" | "consulente";
return list.filter((inv) =>
  `${inv.token} ${inv.role}`.toLowerCase().includes(t)
);


type Invite = {
  id: string;
  token: string;
  role: InviteRole;
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
  status: InviteStatus;
};

export default function MembersInvitesPage() {
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);

  const [list, setList] = useState<Invite[]>([]);
  const [q, setQ] = useState("");

  const [role, setRole] = useState<InviteRole>("medium");
  const [expiryDays, setExpiryDays] = useState<string>("7");

  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  // 🔹 busca casa ativa (backend decide)
  useEffect(() => {
    fetch("/api/me/house")
      .then((r) => r.json())
      .then((d) => setActiveHouseId(d.house_id ?? null))
      .catch(() => setActiveHouseId(null));
  }, []);

  async function loadInvites() {
    const res = await fetch("/api/invites");
    const json = await res.json();
    setList(json.invites ?? []);
  }

  useEffect(() => {
    loadInvites();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((inv) =>
      `${inv.token} ${inv.role} ${inv.status}`.toLowerCase().includes(t)
    );
  }, [q, list]);

  async function createInvite() {
    if (!activeHouseId) {
      showToast("Casa ativa não encontrada.");
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

    showToast("Convite criado!");
    loadInvites();
  }

  function inviteLink(token: string) {
    return `${window.location.origin}/onboarding/${token}`;
  }

  async function copyLink(token: string) {
    const link = inviteLink(token);
    await navigator.clipboard.writeText(link);
    showToast("Link copiado!");
  }

  function openWhatsApp(token: string) {
    const link = inviteLink(token);
    const msg =
      `Olá! Segue seu link para cadastro no Zellador:\n\n` +
      `➡️ ${link}\n\n` +
      `Qualquer dúvida, me chama por aqui.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="page">
      <div className="listTop">
        <h1 className="listTitle">Convites</h1>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* Criar convite */}
      <div className="panel">
        <div className="panelHeader">
          <h2>Criar convite</h2>
        </div>

        <div className="panelBody">
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

          <button className="btnPrimary" disabled={loading} onClick={createInvite}>
            {loading ? "Gerando..." : "Gerar link"}
          </button>
        </div>
      </div>

      {/* Busca */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por token, tipo ou status…"
      />

      {/* Lista */}
      <table className="table">
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
          {filtered.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.role === "medium" ? "Médium" : "Consulente"}</td>
              <td>{inv.token}</td>
              <td>
  {inv.used_at
    ? "Usado"
    : inv.expires_at && new Date(inv.expires_at) < new Date()
    ? "Expirado"
    : "Ativo"}
</td>

              <td>{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "—"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => copyLink(inv.token)}>Copiar</button>
                <button onClick={() => openWhatsApp(inv.token)}>WhatsApp</button>
                <a href={inviteLink(inv.token)} target="_blank">Abrir</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
