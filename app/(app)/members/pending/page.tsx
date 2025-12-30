"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PENDING_KEY = "zellador:pending_members:v1";

type PendingMember = {
  id: string;
  token: string;
  role: "medium" | "consulente";
  name: string;
  whatsapp: string;
  email?: string;
  consents?: {
    rules?: boolean;
    lgpd?: boolean;
    marketing?: boolean;
    contract?: boolean;
  };
  settingsVersion?: string;
  createdAt: string;
  status: "pending";
};

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function roleLabel(r: PendingMember["role"]) {
  return r === "medium" ? "Médium" : "Consulente";
}

export default function MembersPendingPage() {
  const [list, setList] = useState<PendingMember[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setList(safeJson<PendingMember[]>(localStorage.getItem(PENDING_KEY), []));
  }, []);

  // auto-refresh simples (caso você envie onboarding em outra aba)
  useEffect(() => {
    const t = window.setInterval(() => {
      setList(safeJson<PendingMember[]>(localStorage.getItem(PENDING_KEY), []));
    }, 1500);
    return () => window.clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((p) => {
      const blob = `${p.name} ${p.whatsapp} ${p.email ?? ""} ${p.role} ${p.settingsVersion ?? ""}`.toLowerCase();
      return blob.includes(t);
    });
  }, [q, list]);

  return (
    <div className="page">
      <div className="listTop" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 className="listTitle" style={{ fontSize: 44 }}>Pendentes</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            Cadastros enviados pelo onboarding aguardando aprovação do administrador.
          </div>
        </div>

        <div className="badge badgeSoft">MVP</div>
      </div>

      <div className="listActions" style={{ marginTop: 14 }}>
        <div className="searchBox" style={{ minWidth: 360 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, WhatsApp, email, tipo…"
          />
          <span className="searchIcon">🔍</span>
        </div>

        <div className="muted" style={{ marginLeft: "auto" }}>
          Total: <strong>{filtered.length}</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">✅</div>
          <div className="emptyTitle">Nada pendente</div>
          <div className="emptyText">Quando alguém enviar o cadastro pelo link, ele aparece aqui.</div>
        </div>
      ) : (
        <div className="tableWrap" style={{ marginTop: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>WhatsApp</th>
                <th>Email</th>
                <th>Versão termos</th>
                <th>Enviado em</th>
                <th style={{ width: 150 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/members/pending/${p.id}`} className="linkStrong">
                      {p.name}
                    </Link>
                  </td>
                  <td>{roleLabel(p.role)}</td>
                  <td>{p.whatsapp}</td>
                  <td>{p.email || "—"}</td>
                  <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {p.settingsVersion || "—"}
                  </td>
                  <td>{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
                  <td>
                    <Link className="btnGhost" href={`/members/pending/${p.id}`}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="muted" style={{ marginTop: 10 }}>
            Dica: abra um convite em outra aba, envie o cadastro e veja ele aparecer aqui.
          </div>
        </div>
      )}
    </div>
  );
}
