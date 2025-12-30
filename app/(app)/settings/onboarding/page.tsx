"use client";

import { useEffect, useMemo, useState } from "react";

type OnboardingSettings = {
  versionId: string;
  updatedAt: string;

  rulesEnabled: boolean; // regras sempre existirão, mas você pode permitir "desligar" se quiser
  rulesRequired: boolean;
  rulesText: string;

  lgpdRequired: boolean; // sempre true no MVP (trava o aceite)
  lgpdText: string;
  lgpdMarketingOptInEnabled: boolean; // checkbox opcional "quero receber comunicados"

  contractEnabled: boolean; // opcional por casa
  contractRequired: boolean; // se enabled, normalmente required
  contractText: string;

  // placeholders/variáveis futuras
  houseName?: string;
};

const STORAGE_KEY = "zellador:onboarding_settings:v1";

function newVersionId() {
  return "v_" + Math.random().toString(16).slice(2, 10).toUpperCase();
}

const DEFAULT_LGPD = `TERMO DE CIÊNCIA E CONSENTIMENTO (LGPD)

Nós utilizamos seus dados pessoais para: (1) gestão de membros e atividades da casa, (2) comunicação sobre agenda, avisos e eventos, (3) segurança e organização interna.

Você pode solicitar atualização ou exclusão de dados conforme as regras aplicáveis e as necessidades de registro da casa.`;

const DEFAULT_RULES = `REGRAS DA CASA (exemplo)

1) Respeito e convivência: postura respeitosa com todos.
2) Compromissos: pontualidade e comunicação prévia em ausências.
3) Sigilo: informações espirituais e de consulência não devem ser expostas.
4) Uso de imagem e comunicados: conforme consentimento no formulário.`;

const DEFAULT_CONTRACT = `TERMO DE COMPROMISSO (opcional)

Eu, {{NOME_COMPLETO}}, declaro ciência e concordância com as regras e princípios da casa {{CASA_NOME}}.
Data: {{DATA}}`;

function loadSettings(): OnboardingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const now = new Date().toISOString();

  // padrão MVP
  return {
    versionId: newVersionId(),
    updatedAt: now,

    rulesEnabled: true,
    rulesRequired: true,
    rulesText: DEFAULT_RULES,

    lgpdRequired: true,
    lgpdText: DEFAULT_LGPD,
    lgpdMarketingOptInEnabled: true,

    contractEnabled: false,
    contractRequired: true,
    contractText: DEFAULT_CONTRACT,
    houseName: "Sua casa",
  };
}

function saveSettings(s: OnboardingSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function SettingsOnboardingPage() {
  const [loaded, setLoaded] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const [settings, setSettings] = useState<OnboardingSettings | null>(null);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setLoaded(true);
  }, []);

  const preview = useMemo(() => {
    if (!settings) return "";
    const today = new Date().toLocaleDateString("pt-BR");
    return (settings.contractText || "")
      .replaceAll("{{NOME_COMPLETO}}", "NOME DO MEMBRO")
      .replaceAll("{{CASA_NOME}}", settings.houseName || "CASA")
      .replaceAll("{{DATA}}", today);
  }, [settings]);

  if (!loaded || !settings) {
    return <div className="page">Carregando…</div>;
  }

  function set<K extends keyof OnboardingSettings>(key: K, value: OnboardingSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleSave() {
    const now = new Date().toISOString();

    // garante regras e LGPD no MVP
    const next: OnboardingSettings = {
      ...settings,
      rulesEnabled: true, // se você quiser permitir desligar, remova esta linha
      lgpdRequired: true,
      versionId: newVersionId(),
      updatedAt: now,
    };

    saveSettings(next);
    setSettings(next);
    setSavedToast("Configurações salvas!");
    window.setTimeout(() => setSavedToast(null), 2200);
  }

  function handleResetDefaults() {
    if (!confirm("Restaurar padrões? Você perderá as alterações atuais.")) return;
    const now = new Date().toISOString();
    const reset: OnboardingSettings = {
      versionId: newVersionId(),
      updatedAt: now,

      rulesEnabled: true,
      rulesRequired: true,
      rulesText: DEFAULT_RULES,

      lgpdRequired: true,
      lgpdText: DEFAULT_LGPD,
      lgpdMarketingOptInEnabled: true,

      contractEnabled: false,
      contractRequired: true,
      contractText: DEFAULT_CONTRACT,
      houseName: "Sua casa",
    };
    saveSettings(reset);
    setSettings(reset);
    setSavedToast("Padrões restaurados!");
    window.setTimeout(() => setSavedToast(null), 2200);
  };

  async function gerarConvite(role: "medium" | "consulente") {
  try {
    const res = await fetch("/api/invites/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        house_id: activeHouseId, // 👈 já existente no seu contexto
        role,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || "Erro ao gerar convite");
      return;
    }

    await navigator.clipboard.writeText(json.link);
    alert("Convite gerado e link copiado!");
  } catch (e) {
    alert("Falha ao gerar convite");
  }
}


  return (
    <div className="page">
      <div className="listTop">
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Onboarding</h1>
          <div className="muted">
            Defina o que o membro precisa ler e aceitar antes de enviar o cadastro para aprovação.
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            Versão atual: <strong>{settings.versionId}</strong> • Atualizado em{" "}
            {new Date(settings.updatedAt).toLocaleString("pt-BR")}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btnGhost" onClick={handleResetDefaults}>
            Restaurar padrões
          </button>
          <button className="btnPrimary" onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
  <button onClick={() => gerarConvite("medium")}>
    Gerar convite – Médium
  </button>

  <button onClick={() => gerarConvite("consulente")}>
    Gerar convite – Consulente
  </button>
</div>

      {savedToast && <div className="toast">{savedToast}</div>}

      <div className="settingsGrid">
        {/* Regras */}
        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Regras da casa</h2>
              <div className="muted">Texto obrigatório antes do aceite final.</div>
            </div>
            <span className="badge">Obrigatório</span>
          </div>

          <div className="panelBody">
            <label className="checkRow">
              <input
                type="checkbox"
                checked={settings.rulesRequired}
                onChange={(e) => set("rulesRequired", e.target.checked)}
              />
              <span>Exigir “Li e concordo”</span>
            </label>

            <div className="field">
              <label>Texto das regras</label>
              <textarea
                value={settings.rulesText}
                onChange={(e) => set("rulesText", e.target.value)}
                rows={10}
                placeholder="Cole aqui as regras da casa…"
              />
            </div>
          </div>
        </section>

        {/* LGPD */}
        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">LGPD</h2>
              <div className="muted">Ciência e consentimento para uso de dados (aceite obrigatório).</div>
            </div>
            <span className="badge">Obrigatório</span>
          </div>

          <div className="panelBody">
            <label className="checkRow">
              <input type="checkbox" checked={true} readOnly />
              <span>Aceite obrigatório (fixo no MVP)</span>
            </label>

            <label className="checkRow">
              <input
                type="checkbox"
                checked={settings.lgpdMarketingOptInEnabled}
                onChange={(e) => set("lgpdMarketingOptInEnabled", e.target.checked)}
              />
              <span>Exibir consentimento opcional: “Quero receber comunicados”</span>
            </label>

            <div className="field">
              <label>Texto LGPD</label>
              <textarea
                value={settings.lgpdText}
                onChange={(e) => set("lgpdText", e.target.value)}
                rows={10}
                placeholder="Cole aqui o texto de LGPD…"
              />
            </div>
          </div>
        </section>

        {/* Contrato opcional */}
        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Contrato / Termo</h2>
              <div className="muted">Opcional por casa. Se ativar, aparece no onboarding para aceite.</div>
            </div>
            <span className="badge badgeSoft">Opcional</span>
          </div>

          <div className="panelBody">
            <label className="checkRow">
              <input
                type="checkbox"
                checked={settings.contractEnabled}
                onChange={(e) => set("contractEnabled", e.target.checked)}
              />
              <span>Ativar contrato</span>
            </label>

            {settings.contractEnabled && (
              <>
                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={settings.contractRequired}
                    onChange={(e) => set("contractRequired", e.target.checked)}
                  />
                  <span>Exigir aceite do contrato</span>
                </label>

                <div className="field">
                  <label>Modelo do contrato (copiar/colar)</label>
                  <textarea
                    value={settings.contractText}
                    onChange={(e) => set("contractText", e.target.value)}
                    rows={10}
                    placeholder="Cole aqui o termo/contrato…"
                  />
                </div>

                <div className="field">
                  <label>Prévia com variáveis</label>
                  <div className="previewBox">{preview}</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Variáveis disponíveis: <code>{"{{NOME_COMPLETO}}"}</code>{" "}
                    <code>{"{{CASA_NOME}}"}</code> <code>{"{{DATA}}"}</code>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
