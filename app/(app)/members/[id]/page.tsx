"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<ApprovedMember[]>([]);

  useEffect(() => {
    setList(safeJson<ApprovedMember[]>(localStorage.getItem(MEMBERS_KEY), []));
  }, []);

  const member = useMemo(() => list.find((m) => m.id === id) || null, [list, id]);

  if (!member) {
    return (
      <div className="page">
        <h1>Membro não encontrado</h1>
        <div className="muted" style={{ marginTop: 6 }}>
          Pode ter sido removido ou o storage foi limpo.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link className="btnGhost" href="/members">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 44, marginBottom: 6 }}>{member.name}</h1>
          <div className="muted">
            {roleLabel(member.role)} • Status:{" "}
            <strong>{member.active ? "Ativo" : "Inativo"}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btnGhost" href="/members">Voltar</Link>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Dados</div>
              <div className="muted">Informações básicas do cadastro.</div>
            </div>
          </div>
          <div className="panelBody">
            <div className="kv">
              <div className="kvRow">
                <span className="kvKey">WhatsApp</span>
                <span className="kvVal">{member.whatsapp}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Email</span>
                <span className="kvVal">{member.email || "—"}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Entrada</span>
                <span className="kvVal">{new Date(member.approvedAt).toLocaleString("pt-BR")}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Aprovado por</span>
                <span className="kvVal">{member.approvedBy}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Versão termos</span>
                <span className="kvVal" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {member.settingsVersion || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Aceites</div>
              <div className="muted">Registro dos consentimentos.</div>
            </div>
          </div>
          <div className="panelBody">
            <div className="checkList">
              <div className="checkItem">
                <span>Regras da casa</span>
                <strong>{member.consents.rules ? "✅ Aceito" : "❌ Não"}</strong>
              </div>
              <div className="checkItem">
                <span>LGPD</span>
                <strong>{member.consents.lgpd ? "✅ Aceito" : "❌ Não"}</strong>
              </div>
              <div className="checkItem">
                <span>Comunicados</span>
                <strong>{member.consents.marketing ? "✅ Sim" : "— Não"}</strong>
              </div>
              <div className="checkItem">
                <span>Contrato</span>
                <strong>{member.consents.contract ? "✅ Aceito" : "— Não"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="muted" style={{ marginTop: 12 }}>
        Próximo passo: aqui vão entrar as abas internas (Pessoal, Contato, Endereço, Saúde, Espiritual…).
        Mas por enquanto, MVP = cadastro + governança.
      </div>
    </div>
  );
}
