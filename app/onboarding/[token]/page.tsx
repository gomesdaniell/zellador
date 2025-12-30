"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Invite = {
  id: string;
  token: string;
  role: "medium" | "consulente";
  status: "active" | "used" | "expired" | "disabled";
  expiresAt?: string | null;
};

type NormalizedSettings = {
  versionId: string;

  rulesRequired: boolean;
  rulesText: string;

  lgpdRequired: boolean; // fixo true no MVP, mas deixo aqui
  lgpdText: string;
  lgpdMarketingOptInEnabled: boolean;

  contractEnabled: boolean;
  contractRequired: boolean;
  contractText: string;
};

const INVITES_KEY = "zellador:invites:v1";
const SETTINGS_KEY = "zellador:onboarding_settings:v1";
const PENDING_KEY = "zellador:pending_members:v1";

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// tenta extrair texto/flags independente do formato salvo
function normalizeSettings(raw: any): NormalizedSettings {
  const defaults: NormalizedSettings = {
    versionId: "v_default",

    rulesRequired: true,
    rulesText:
      "REGRAS DA CASA\n\n(1) Respeito e convivência.\n(2) Compromissos e pontualidade.\n(3) Sigilo.\n(4) Uso de imagem conforme consentimento.",

    lgpdRequired: true,
    lgpdText:
      "TERMO DE CIÊNCIA E CONSENTIMENTO (LGPD)\n\nUtilizamos seus dados para gestão e comunicação interna. Você pode solicitar atualização ou exclusão conforme aplicável.",
    lgpdMarketingOptInEnabled: false,

    contractEnabled: false,
    contractRequired: false,
    contractText: "",
  };

  if (!raw || typeof raw !== "object") return defaults;

  // suporta formato "flat" (rulesText, lgpdText etc)
  const flatRulesText = raw.rulesText ?? raw.rules_text ?? raw.rules;
  const flatLgpdText = raw.lgpdText ?? raw.lgpd_text ?? raw.lgpd;
  const flatContractText = raw.contractText ?? raw.contract_text ?? raw.contract;

  // suporta formato "nested" (rules.text, lgpd.text, contract.text)
  const nestedRulesText = raw.rules?.text ?? raw.rules?.content ?? raw.rules?.value;
  const nestedLgpdText = raw.lgpd?.text ?? raw.lgpd?.content ?? raw.lgpd?.value;
  const nestedContractText = raw.contract?.text ?? raw.contract?.content ?? raw.contract?.value;

  const rulesText = String(nestedRulesText ?? flatRulesText ?? defaults.rulesText ?? "");
  const lgpdText = String(nestedLgpdText ?? flatLgpdText ?? defaults.lgpdText ?? "");
  const contractText = String(nestedContractText ?? flatContractText ?? defaults.contractText ?? "");

  // flags (flat e nested)
  const rulesRequired =
    Boolean(raw.rulesRequired ?? raw.rules_required ?? raw.rules?.required ?? raw.rules?.isRequired ?? defaults.rulesRequired);

  const lgpdMarketingOptInEnabled =
    Boolean(raw.lgpdMarketingOptInEnabled ?? raw.lgpd_marketing_optin ?? raw.lgpd?.marketingOptInEnabled ?? raw.lgpd?.optInEnabled ?? false);

  const contractEnabled =
    Boolean(raw.contractEnabled ?? raw.contract_enabled ?? raw.contract?.enabled ?? raw.contract?.isEnabled ?? false);

  const contractRequired =
    Boolean(raw.contractRequired ?? raw.contract_required ?? raw.contract?.required ?? raw.contract?.isRequired ?? false);

  const versionId = String(raw.versionId ?? raw.version ?? raw.version_id ?? defaults.versionId);

  return {
    versionId,
    rulesRequired,
    rulesText: rulesText.trim() || defaults.rulesText,
    lgpdRequired: true,
    lgpdText: lgpdText.trim() || defaults.lgpdText,
    lgpdMarketingOptInEnabled,
    contractEnabled,
    contractRequired,
    contractText,
  };
}

function isInviteExpired(inv: Invite) {
  if (!inv.expiresAt) return false;
  return new Date(inv.expiresAt).getTime() < Date.now();
}

function roleLabel(r: Invite["role"]) {
  return r === "medium" ? "Médium" : "Consulente";
}

export default function OnboardingWizard() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [step, setStep] = useState(1);

  const [invite, setInvite] = useState<Invite | null>(null);
  const [settings, setSettings] = useState<NormalizedSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptLgpd, setAcceptLgpd] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [acceptContract, setAcceptContract] = useState(false);

  useEffect(() => {
    try {
      const invites = safeJson<Invite[]>(localStorage.getItem(INVITES_KEY), []);
      const found = invites.find((i) => i.token === token);

      if (!found) {
        setError("Convite não encontrado.");
        return;
      }
      if (found.status !== "active") {
        setError("Convite inválido, expirado ou já utilizado.");
        return;
      }
      if (isInviteExpired(found)) {
        setError("Convite expirado.");
        return;
      }

      setInvite(found);

      const rawSettings = safeJson<any>(localStorage.getItem(SETTINGS_KEY), null);
      setSettings(normalizeSettings(rawSettings));
    } catch {
      setError("Erro ao carregar convite/configurações.");
    }
  }, [token]);

  const canGoStep2 = useMemo(() => true, []);
  const canGoStep3 = useMemo(() => name.trim().length > 2 && whatsapp.trim().length >= 8, [name, whatsapp]);

  const canSubmit = useMemo(() => {
    if (!settings) return false;
    if (settings.rulesRequired && !acceptRules) return false;
    if (!acceptLgpd) return false;
    if (settings.contractEnabled && settings.contractRequired && !acceptContract) return false;
    return true;
  }, [settings, acceptRules, acceptLgpd, acceptContract]);

  function next() {
    setStep((s) => Math.min(4, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function submit() {
    if (!invite || !settings) return;

    const pending = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `pend_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      token,
      role: invite.role,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim() || "",
      consents: {
        rules: acceptRules,
        lgpd: acceptLgpd,
        marketing: settings.lgpdMarketingOptInEnabled ? acceptMarketing : false,
        contract: settings.contractEnabled ? acceptContract : false,
      },
      settingsVersion: settings.versionId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const pendings = safeJson<any[]>(localStorage.getItem(PENDING_KEY), []);
    localStorage.setItem(PENDING_KEY, JSON.stringify([pending, ...pendings]));

    // marca convite como usado
    const invites = safeJson<Invite[]>(localStorage.getItem(INVITES_KEY), []);
    const updated = invites.map((i) => (i.token === token ? { ...i, status: "used" as const } : i));
    localStorage.setItem(INVITES_KEY, JSON.stringify(updated));

    next();
  }

  if (error) {
    return (
      <div className="page" style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1>Convite inválido</h1>
        <p className="muted">{error}</p>
      </div>
    );
  }

  if (!invite || !settings) {
    return (
      <div className="page" style={{ maxWidth: 760, margin: "0 auto" }}>
        Carregando…
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 54, marginBottom: 10 }}>Cadastro no Terreiro</h1>
      <div className="muted" style={{ marginBottom: 18 }}>
        Tipo: <strong>{roleLabel(invite.role)}</strong> • Termos: <strong>{settings.versionId}</strong>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="panel">
          <div className="panelBody">
            <h2 style={{ margin: 0 }}>Bem-vindo(a)</h2>
            <div className="muted">
              Você recebeu um convite para se cadastrar. Leva poucos minutos.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="btnPrimary" onClick={next} disabled={!canGoStep2}>
                Iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="panel">
          <div className="panelBody">
            <h2 style={{ margin: 0 }}>Dados básicos</h2>

            <div className="field">
              <label>Nome completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>

            <div className="field">
              <label>WhatsApp</label>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(DDD) número" />
            </div>

            <div className="field">
              <label>Email (opcional)</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@..." />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btnGhost" onClick={back}>
                Voltar
              </button>
              <button className="btnPrimary" onClick={next} disabled={!canGoStep3}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="panel">
          <div className="panelBody">
            <h2 style={{ margin: 0 }}>Termos e aceites</h2>

            {/* REGRAS */}
            <div className="panel" style={{ background: "rgba(255,255,255,.03)" }}>
              <div className="panelBody">
                <strong>Regras da casa</strong>
                <div className="previewBox" style={{ marginTop: 10 }}>
                  {settings.rulesText}
                </div>

                <label className="checkRow" style={{ marginTop: 10 }}>
                  <input type="checkbox" checked={acceptRules} onChange={(e) => setAcceptRules(e.target.checked)} />
                  Li e concordo
                </label>
              </div>
            </div>

            {/* LGPD */}
            <div className="panel" style={{ background: "rgba(255,255,255,.03)" }}>
              <div className="panelBody">
                <strong>LGPD</strong>
                <div className="previewBox" style={{ marginTop: 10 }}>
                  {settings.lgpdText}
                </div>

                <label className="checkRow" style={{ marginTop: 10 }}>
                  <input type="checkbox" checked={acceptLgpd} onChange={(e) => setAcceptLgpd(e.target.checked)} />
                  Concordo com o uso dos dados
                </label>

                {settings.lgpdMarketingOptInEnabled && (
                  <label className="checkRow">
                    <input
                      type="checkbox"
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                    />
                    Quero receber comunicados
                  </label>
                )}
              </div>
            </div>

            {/* CONTRATO (opcional) */}
            {settings.contractEnabled && (
              <div className="panel" style={{ background: "rgba(255,255,255,.03)" }}>
                <div className="panelBody">
                  <strong>Contrato</strong>
                  <div className="previewBox" style={{ marginTop: 10 }}>
                    {settings.contractText || "Contrato não configurado."}
                  </div>

                  <label className="checkRow" style={{ marginTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={acceptContract}
                      onChange={(e) => setAcceptContract(e.target.checked)}
                    />
                    Aceito o contrato
                  </label>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btnGhost" onClick={back}>
                Voltar
              </button>
              <button className="btnPrimary" onClick={submit} disabled={!canSubmit}>
                Enviar para aprovação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="panel">
          <div className="panelBody">
            <h2 style={{ margin: 0 }}>Cadastro enviado!</h2>
            <div className="muted">
              Seu cadastro foi enviado para aprovação da administração. Você receberá retorno em breve.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
