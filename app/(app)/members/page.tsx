"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const MEMBERS_KEY = "zellador:members:v1";

type ApprovedMember = {
  id: string;
  sourcePendingId: string;
  role: "medium" | "consulente";
  name: string;
  whatsapp: string;
  email?: string;
  active: boolean;
  approvedAt: string;
  approvedBy: string;
  consents: {
    rules: boolean;
    lgpd: boolean;
    marketing: boolean;
    contract: boolean;
  };
  settingsVersion?: string;
};

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function roleLabel(r: ApprovedMember["role"]) {
  return r === "medium" ? "Médium" : "Consulente";
}

export default function MembersPage({
  forcedType,
  title = "Membros",
}: {
  forcedType?: "medium" | "consulente";
  title?: string;
}) {
  const [list, setList] = useState<ApprovedMember[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "medium" | "consulente">(forcedType ?? "all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    setList(safeJson<ApprovedMember[]>(localStorage.getItem(MEMBERS_KEY), []));
  }, []);

  // se trocar de rota (ex.: /members -> /members/mediuns), força o filtro certo
  useEffect(() => {
    if (forcedType) setType(forcedType);
  }, [forcedType]);

  function persist(next: ApprovedMember[]) {
    setList(next);
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(next));
  }

  function toggleActive(id: string) {
    const next = list.map((m) => (m.id === id ? { ...m, active: !m.active } : m));
    persist(next);
  }

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();

    return list
      .filter((m) => (type === "all" ? true : m.role === type))
      .filter((m) => {
        if (status === "all") return true;
        return status === "active" ? m.active : !m.active;
      })
      .filter((m) => {
        if (!t) return true;
        const blob = `${m.name} ${m.whatsapp} ${m.email ?? ""} ${m.role}`.toLowerCase();
        return blob.includes(t);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [list, q, type, status]);

  const totals = useMemo(() => {
    const total = list.length;
    const active = list.filter((m) => m.active).length;
    const inactive = total - active;
    const mediums = list.filter((m) => m.role === "medium").length;
    const consulentes = list.filter((m) => m.role === "consulente").length;
    return { total, active, inactive, mediums, consulentes };
  }, [list]);

  return (
    <div className="page">
      <div className="listTop" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 className="listTitle" style={{ fontSize: 44 }}>
            {title}
          </h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Lista de cadastros aprovados. Você pode ativar/desativar e acessar o detalhe.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btnGhost" href="/members/pending">
            Pendentes
          </Link>
          <Link className="btnGhost" href="/members/invites">
            Convites
          </Link>
          <span className="badge badgeSoft">MVP</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panelBody" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div className="searchBox" style={{ minWidth: 320, flex: 1 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, WhatsApp, email…" />
            <span className="searchIcon">🔍</span>
          </div>

          {/* Se for uma página filtrada (ex.: /members/mediuns), não mostra o select de tipo */}
          {!forcedType && (
            <div className="field" style={{ minWidth: 200 }}>
              <label>Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="all">Todos</option>
                <option value="medium">Médiuns</option>
                <option value="consulente">Consulentes</option>
              </select>
            </div>
          )}

          <div className="field" style={{ minWidth: 200 }}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div className="muted" style={{ marginLeft: "auto" }}>
            Mostrando <strong>{filtered.length}</strong> de <strong>{totals.total}</strong>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panelBody" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span className="badge">Ativos: {totals.active}</span>
          <span className="badge">Inativos: {totals.inactive}</span>
          <span className="badge">Médiuns: {totals.mediums}</span>
          <span className="badge">Consulentes: {totals.consulentes}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="emptyState" style={{ marginTop: 16 }}>
          <div className="emptyIcon">👥</div>
          <div className="emptyTitle">Nenhum membro encontrado</div>
          <div className="emptyText">
            Ajuste os filtros ou aprove alguém em{" "}
            <Link href="/members/pending" className="linkStrong">
              Pendentes
            </Link>
            .
          </div>
        </div>
      ) : (
        <div className="tableWrap" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Status</th>
                <th>Entrada</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/members/${m.id}`} className="linkStrong">
                      {m.name}
                    </Link>
                  </td>
                  <td>{roleLabel(m.role)}</td>
                  <td>{m.whatsapp}</td>
                  <td>{m.email || "—"}</td>
                  <td>
                    <span className={`pill ${m.active ? "pillOk" : "pillMuted"}`}>{m.active ? "Ativo" : "Inativo"}</span>
                  </td>
                  <td>{new Date(m.approvedAt).toLocaleDateString("pt-BR")}</td>
                  <td style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Link className="btnGhost" href={`/members/${m.id}`}>
                      Ver
                    </Link>
                    <button className="btnGhost" onClick={() => toggleActive(m.id)}>
                      {m.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
