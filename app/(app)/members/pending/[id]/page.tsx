"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PENDING_KEY = "zellador:pending_members:v1";
const MEMBERS_KEY = "zellador:members:v1";
const REJECTED_KEY = "zellador:rejected_members:v1";

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

type ApprovedMember = {
  id: string; // novo id definitivo
  sourcePendingId: string;
  role: "medium" | "consulente";
  name: string;
  whatsapp: string;
  email?: string;
  active: boolean;
  approvedAt: string;
  approvedBy: string; // MVP fixo
  consents: {
    rules: boolean;
    lgpd: boolean;
    marketing: boolean;
    contract: boolean;
  };
  settingsVersion?: string;
};

type Rejected = {
  id: string;
  sourcePendingId: string;
  rejectedAt: string;
  rejectedBy: string;
  reason?: string;
  payload: PendingMember;
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

export default function PendingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pendingList, setPendingList] = useState<PendingMember[]>([]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setPendingList(safeJson<PendingMember[]>(localStorage.getItem(PENDING_KEY), []));
  }, []);

  const item = useMemo(() => pendingList.find((p) => p.id === id) || null, [pendingList, id]);

  const consents = useMemo(() => {
    const c = item?.consents || {};
    return {
      rules: Boolean(c.rules),
      lgpd: Boolean(c.lgpd),
      marketing: Boolean(c.marketing),
      contract: Boolean(c.contract),
    };
  }, [item]);

  function approve() {
    if (!item) return;

    const members = safeJson<ApprovedMember[]>(localStorage.getItem(MEMBERS_KEY), []);

    const approved: ApprovedMember = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `mem_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      sourcePendingId: item.id,
      role: item.role,
      name: item.name,
      whatsapp: item.whatsapp,
      email: item.email || "",
      active: true,
      approvedAt: new Date().toISOString(),
      approvedBy: "admin@mvp", // depois conectamos com auth
      consents,
      settingsVersion: item.settingsVersion,
    };

    localStorage.setItem(MEMBERS_KEY, JSON.stringify([approved, ...members]));

    // remove do pending
    const nextPending = pendingList.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(nextPending));
    setPendingList(nextPending);

    router.push("/members/pending");
  }

  function reject() {
    if (!item) return;

    const rejected = safeJson<Rejected[]>(localStorage.getItem(REJECTED_KEY), []);
    const entry: Rejected = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `rej_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      sourcePendingId: item.id,
      rejectedAt: new Date().toISOString(),
      rejectedBy: "admin@mvp",
      reason: reason.trim() || undefined,
      payload: item,
    };
    localStorage.setItem(REJECTED_KEY, JSON.stringify([entry, ...rejected]));

    // remove do pending
    const nextPending = pendingList.filter((p) => p.id !== item.id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(nextPending));
    setPendingList(nextPending);

    router.push("/members/pending");
  }

  if (!item) {
    return (
      <div className="page">
        <h1>Pendente não encontrado</h1>
        <div className="muted" style={{ marginTop: 6 }}>
          Pode ter sido aprovado/rejeitado em outra aba.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link className="btnGhost" href="/members/pending">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 44, marginBottom: 6 }}>{item.name}</h1>
          <div className="muted">
            {roleLabel(item.role)} • enviado em {new Date(item.createdAt).toLocaleString("pt-BR")} • termos{" "}
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {item.settingsVersion || "—"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btnGhost" href="/members/pending">
            Voltar
          </Link>
          <button className="btnPrimary" onClick={approve}>
            Aprovar
          </button>
          <button className="btnGhost" onClick={reject}>
            Rejeitar
          </button>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Dados básicos</div>
              <div className="muted">Informações enviadas pelo onboarding.</div>
            </div>
          </div>
          <div className="panelBody">
            <div className="kv">
              <div className="kvRow">
                <span className="kvKey">WhatsApp</span>
                <span className="kvVal">{item.whatsapp}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Email</span>
                <span className="kvVal">{item.email || "—"}</span>
              </div>
              <div className="kvRow">
                <span className="kvKey">Token</span>
                <span className="kvVal" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {item.token}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Aceites</div>
              <div className="muted">Status dos consentimentos.</div>
            </div>
          </div>
          <div className="panelBody">
            <div className="checkList">
              <div className="checkItem">
                <span>Regras da casa</span>
                <strong>{consents.rules ? "✅ Aceito" : "❌ Não aceito"}</strong>
              </div>
              <div className="checkItem">
                <span>LGPD</span>
                <strong>{consents.lgpd ? "✅ Aceito" : "❌ Não aceito"}</strong>
              </div>
              <div className="checkItem">
                <span>Comunicados (opcional)</span>
                <strong>{consents.marketing ? "✅ Sim" : "— Não"}</strong>
              </div>
              <div className="checkItem">
                <span>Contrato (se habilitado)</span>
                <strong>{consents.contract ? "✅ Aceito" : "— Não"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panelHeader">
          <div>
            <div className="panelTitle">Rejeição (opcional)</div>
            <div className="muted">Se for rejeitar, você pode registrar um motivo (interno).</div>
          </div>
        </div>
        <div className="panelBody">
          <div className="field">
            <label>Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: cadastro incompleto / precisa vir conversar / dados inválidos…"
              rows={3}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btnGhost" onClick={reject}>
              Rejeitar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
