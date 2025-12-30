"use client";

import { useEffect, useMemo, useState } from "react";

type InviteRole = "medium" | "consulente";
type InviteStatus = "active" | "used" | "disabled" | "expired";

type Invite = {
  id: string;
  token: string;
  role: InviteRole;
  createdAt: string; // ISO
  expiresAt: string | null; // ISO or null
  usedAt: string | null; // ISO or null
  status: InviteStatus;
};

const INVITES_KEY = "zellador:invites:v1";
const ONBOARDING_SETTINGS_KEY = "zellador:onboarding_settings:v1";

function uid(prefix = "inv") {
  return `${prefix}_${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

function newToken() {
  // token simples p/ MVP; depois você pode trocar por crypto.randomUUID() / base64url
  return Math.random().toString(36).slice(2, 10).toUpperCase() + "-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function loadInvites(): Invite[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveInvites(list: Invite[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(list));
}

function getBaseUrl() {
  // Em produção: zellador.com.br; Em dev: localhost
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function computeExpiresAt(days: number | null) {
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isExpired(inv: Invite) {
  if (!inv.expiresAt) return false;
  return new Date(inv.expiresAt).getTime() < Date.now();
}

function roleLabel(r: InviteRole) {
  return r === "medium" ? "Médium" : "Consulente";
}

function statusLabel(s: InviteStatus) {
  if (s === "active") return "Ativo";
  if (s === "used") return "Usado";
  if (s === "disabled") return "Desativado";
  return "Expirado";
}

export default function MembersInvitesPage() {
  const [list, setList] = useState<Invite[]>([]);
  const [q, setQ] = useState("");

  // form
  const [role, setRole] = useState<InviteRole>("medium");
  const [expiryDays, setExpiryDays] = useState<string>("7");

  // ui
  const [toast, setToast] = useState<string | null>(null);

  // carregar
  useEffect(() => {
    const loaded = loadInvites();
    setList(loaded);
  }, []);

  // recalcular expirados ao carregar e ao mudar lista
  useEffect(() => {
    setList((prev) => {
      let changed = false;
      const next = prev.map((inv) => {
        if (inv.status === "active" && isExpired(inv)) {
          changed = true;
          return { ...inv, status: "expired" as InviteStatus };
        }
        return inv;
      });
      if (changed) saveInvites(next);
      return next;
    });
  }, []);

  // persistir
  useEffect(() => {
    saveInvites(list);
  }, [list]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((inv) => {
      const blob = `${inv.token} ${inv.role} ${inv.status}`.toLowerCase();
      return blob.includes(t);
    });
  }, [q, list]);

  const baseUrl = getBaseUrl();

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  function createInvite() {
    const days = expiryDays === "never" ? null : Number(expiryDays);
    const inv: Invite = {
      id: uid(),
      token: newToken(),
      role,
      createdAt: new Date().toISOString(),
      expiresAt: computeExpiresAt(days),
      usedAt: null,
      status: "active",
    };

    setList((prev) => [inv, ...prev]);
    showToast("Convite criado!");
  }

  function inviteLink(inv: Invite) {
    return `${baseUrl}/onboarding/${inv.token}`;
  }

  async function copyLink(inv: Invite) {
    const link = inviteLink(inv);
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link copiado!");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Link copiado!");
    }
  }

  function openWhatsApp(inv: Invite) {
    const link = inviteLink(inv);

    // lê versão atual do onboarding (se existir) só para informar no texto
    let version = "";
    try {
      const raw = localStorage.getItem(ONBOARDING_SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.versionId) version = ` (versão ${s.versionId})`;
      }
    } catch {}

    const msg =
      `Olá! Segue seu link para cadastro no Zellador${version}.\n\n` +
      `➡️ ${link}\n\n` +
      `Preencha com atenção e, ao final, aceite as regras da casa e a LGPD para enviar para aprovação.\n` +
      `Qualquer dúvida, me chama por aqui.`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  function disableInvite(id: string) {
    setList((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "disabled" } : inv)));
    showToast("Convite desativado.");
  }

  function reactivateInvite(id: string) {
    setList((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        // se expirou, reativar não faz sentido sem reemitir; então a gente reemite token
        if (inv.status === "expired") return inv;
        if (inv.status === "used") return inv;
        return { ...inv, status: "active" };
      })
    );
    showToast("Convite reativado.");
  }

  function reissueInvite(id: string) {
    // gera novo token e reinicia status/validade (mantém role)
    setList((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const days = expiryDays === "never" ? null : Number(expiryDays);
        return {
          ...inv,
          token: newToken(),
          createdAt: new Date().toISOString(),
          expiresAt: computeExpiresAt(days),
          usedAt: null,
          status: "active",
        };
      })
    );
    showToast("Convite reemitido!");
  }

  function markUsed(id: string) {
    setList((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "used", usedAt: new Date().toISOString() } : inv
      )
    );
    showToast("Marcado como usado (simulação).");
  }

  function removeInvite(id: string) {
    if (!confirm("Excluir convite?")) return;
    setList((prev) => prev.filter((inv) => inv.id !== id));
    showToast("Convite excluído.");
  }

  return (
    <div className="page">
      <div className="listTop" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 className="listTitle" style={{ fontSize: 44 }}>Convites</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Gere links para que Médiuns e Consulentes preencham o cadastro e aceitem as regras antes de enviar para aprovação.
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {/* Criar convite */}
      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Criar convite</h2>
            <div className="muted">Escolha o tipo e a validade do link.</div>
          </div>
          <span className="badge badgeSoft">MVP</span>
        </div>

        <div className="panelBody">
          <div className="formRow">
            <div className="field">
              <label>Tipo</label>
              <select value={role} onChange={(e) => setRole(e.target.value as InviteRole)}>
                <option value="medium">Médium</option>
                <option value="consulente">Consulente</option>
              </select>
            </div>

            <div className="field">
              <label>Validade</label>
              <select value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}>
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="never">Sem expiração</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btnPrimary" onClick={createInvite}>
              Gerar link
            </button>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="listActions" style={{ marginTop: 14 }}>
        <div className="searchBox" style={{ minWidth: 360 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por token, tipo ou status…"
          />
          <span className="searchIcon">🔍</span>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">🔗</div>
          <div className="emptyTitle">Nenhum convite</div>
          <div className="emptyText">Crie um convite acima para gerar um link de cadastro.</div>
        </div>
      ) : (
        <div className="tableWrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Token</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Expira em</th>
                <th>Usado em</th>
                <th style={{ width: 360 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const link = inviteLink(inv);

                return (
                  <tr key={inv.id}>
                    <td>{roleLabel(inv.role)}</td>
                    <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{inv.token}</td>
                    <td>{statusLabel(inv.status)}</td>
                    <td>{new Date(inv.createdAt).toLocaleString("pt-BR")}</td>
                    <td>{inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("pt-BR") : "—"}</td>
                    <td>{inv.usedAt ? new Date(inv.usedAt).toLocaleString("pt-BR") : "—"}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btnGhost" onClick={() => copyLink(inv)}>
                          Copiar link
                        </button>

                        <button className="btnGhost" onClick={() => openWhatsApp(inv)}>
                          WhatsApp
                        </button>

                        <a className="btnGhost" href={link} target="_blank" rel="noreferrer">
                          Abrir
                        </a>

                        {inv.status === "active" && (
                          <button className="btnGhost" onClick={() => disableInvite(inv.id)}>
                            Desativar
                          </button>
                        )}

                        {inv.status === "disabled" && (
                          <button className="btnGhost" onClick={() => reactivateInvite(inv.id)}>
                            Reativar
                          </button>
                        )}

                        {(inv.status === "expired" || inv.status === "used") && (
                          <button className="btnGhost" onClick={() => reissueInvite(inv.id)}>
                            Reemitir
                          </button>
                        )}

                        {/* Simulação até criarmos onboarding real */}
                        {inv.status === "active" && (
                          <button className="btnGhost" onClick={() => markUsed(inv.id)}>
                            Marcar usado
                          </button>
                        )}

                        <button className="btnGhost" onClick={() => removeInvite(inv.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="muted" style={{ marginTop: 10 }}>
            * “Marcar usado” é apenas para simular o fluxo até implementarmos o onboarding por token.
          </div>
        </div>
      )}
    </div>
  );
}
