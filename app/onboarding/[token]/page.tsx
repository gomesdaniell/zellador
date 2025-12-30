"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Invite = {
  id: string;
  token: string;
  role: "medium" | "consulente";
  status: "active" | "used" | "expired" | "disabled";
};

type OnboardingSettings = {
  versionId: string;
  rulesText: string;
  rulesRequired: boolean;
  lgpdText: string;
  lgpdMarketingOptInEnabled: boolean;
  contractEnabled: boolean;
  contractRequired: boolean;
  contractText: string;
};

const INVITES_KEY = "zellador:invites:v1";
const SETTINGS_KEY = "zellador:onboarding_settings:v1";
const PENDING_KEY = "zellador:pending_members:v1";

export default function OnboardingWizard() {
  const { token } = useParams<{ token: string }>();

  const [step, setStep] = useState(1);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [settings, setSettings] = useState<OnboardingSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [acceptRules, setAcceptRules] = useState(false);
  const [acceptLgpd, setAcceptLgpd] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [acceptContract, setAcceptContract] = useState(false);

  // load data
  useEffect(() => {
    try {
      const invites: Invite[] = JSON.parse(localStorage.getItem(INVITES_KEY) || "[]");
      const found = invites.find((i) => i.token === token);

      if (!found || found.status !== "active") {
        setError("Convite inválido, expirado ou já utilizado.");
        return;
      }

      setInvite(found);

      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      setSettings(s);
    } catch {
      setError("Erro ao carregar convite.");
    }
  }, [token]);

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  function submit() {
    const pending = {
      id: crypto.randomUUID(),
      token,
      role: invite!.role,
      name,
      whatsapp,
      email,
      consents: {
        rules: acceptRules,
        lgpd: acceptLgpd,
        marketing: acceptMarketing,
        contract: acceptContract,
      },
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    localStorage.setItem(PENDING_KEY, JSON.stringify([pending, ...list]));

    // marcar convite como usado
    const invites = JSON.parse(localStorage.getItem(INVITES_KEY) || "[]");
    const updated = invites.map((i: Invite) =>
      i.token === token ? { ...i, status: "used" } : i
    );
    localStorage.setItem(INVITES_KEY, JSON.stringify(updated));

    next();
  }

  if (error) {
    return (
      <div className="page">
        <h1>Convite inválido</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!invite || !settings) {
    return <div className="page">Carregando…</div>;
  }

  return (
    <div className="page" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>Cadastro no Terreiro</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <section>
          <p>
            Você foi convidado para se cadastrar como{" "}
            <strong>{invite.role === "medium" ? "Médium" : "Consulente"}</strong>.
          </p>
          <button className="btnPrimary" onClick={next}>
            Iniciar cadastro
          </button>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section>
          <h2>Dados básicos</h2>

          <div className="field">
            <label>Nome completo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label>WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="field">
            <label>Email (opcional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btnGhost" onClick={back}>
              Voltar
            </button>
            <button className="btnPrimary" onClick={next} disabled={!name || !whatsapp}>
              Continuar
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section>
          <h2>Termos e aceites</h2>

          <div className="panel">
            <strong>Regras da casa</strong>
            <pre className="previewBox">{settings.rulesText}</pre>
            <label>
              <input type="checkbox" checked={acceptRules} onChange={(e) => setAcceptRules(e.target.checked)} /> Li e concordo
            </label>
          </div>

          <div className="panel">
            <strong>LGPD</strong>
            <pre className="previewBox">{settings.lgpdText}</pre>
            <label>
              <input type="checkbox" checked={acceptLgpd} onChange={(e) => setAcceptLgpd(e.target.checked)} /> Concordo com o uso dos dados
            </label>

            {settings.lgpdMarketingOptInEnabled && (
              <label>
                <input type="checkbox" checked={acceptMarketing} onChange={(e) => setAcceptMarketing(e.target.checked)} /> Aceito receber comunicados
              </label>
            )}
          </div>

          {settings.contractEnabled && (
            <div className="panel">
              <strong>Contrato</strong>
              <pre className="previewBox">{settings.contractText}</pre>
              <label>
                <input type="checkbox" checked={acceptContract} onChange={(e) => setAcceptContract(e.target.checked)} /> Aceito o contrato
              </label>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btnGhost" onClick={back}>
              Voltar
            </button>
            <button
              className="btnPrimary"
              onClick={submit}
              disabled={!acceptRules || !acceptLgpd || (settings.contractEnabled && settings.contractRequired && !acceptContract)}
            >
              Enviar para aprovação
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <section>
          <h2>Cadastro enviado!</h2>
          <p>Seu cadastro foi enviado para aprovação da administração.</p>
        </section>
      )}
    </div>
  );
}
