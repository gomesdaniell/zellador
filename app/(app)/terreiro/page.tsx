"use client";

import { useMemo, useState } from "react";

type TabKey =
  | "terreiro"
  | "contato"
  | "endereco"
  | "orixas"
  | "linha"
  | "graduacao"
  | "cargos"
  | "pix"
  | "orientacoes";

type ModalKind = null | "orixas" | "linha" | "graduacao" | "cargos";

function slugLabel(kind: Exclude<ModalKind, null>) {
  switch (kind) {
    case "orixas":
      return "Orixá";
    case "linha":
      return "Linha";
    case "graduacao":
      return "Graduação";
    case "cargos":
      return "Cargo/Função";
  }
}

export default function TerreiroConfigPage() {
  const tabs = useMemo(
    () => [
      { key: "terreiro" as const, label: "Terreiro" },
      { key: "contato" as const, label: "Contato" },
      { key: "endereco" as const, label: "Endereço" },
      { key: "orixas" as const, label: "Orixás" },
      { key: "linha" as const, label: "Linha" },
      { key: "graduacao" as const, label: "Graduação" },
      { key: "cargos" as const, label: "Cargos" },
      { key: "pix" as const, label: "Chave Pix" },
      { key: "orientacoes" as const, label: "Orientações" },
    ],
    []
  );

  const [active, setActive] = useState<TabKey>("terreiro");
  const [modal, setModal] = useState<ModalKind>(null);
  const [modalValue, setModalValue] = useState("");

  // --- estados do formulário (UI-only) ---
  const [form, setForm] = useState({
    nome: "TUFDS",
    razaoSocial: "",
    cnpj: "",
    dataFundacao: "",
    responsavel: "Daniel Gomes",

    whatsapp: "",
    telefone: "",
    email: "",

    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "Manaus",
    estado: "AM",

    pixTipo: "CPF/CNPJ",
    pixChave: "",
    pixNomeFavorecido: "",
    pixBanco: "",

    orientacoes: "",
  });

  // --- cadastros (UI-only) ---
  const [orixas, setOrixas] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<string[]>([]);
  const [graduacoes, setGraduacoes] = useState<string[]>([]);
  const [cargos, setCargos] = useState<string[]>([]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function openAdd(kind: Exclude<ModalKind, null>) {
    setModalValue("");
    setModal(kind);
  }

  function addItem() {
    const v = modalValue.trim();
    if (!modal || !v) return;

    const applyUnique = (arr: string[]) => {
      const exists = arr.some((x) => x.toLowerCase() === v.toLowerCase());
      return exists ? arr : [...arr, v];
    };

    if (modal === "orixas") setOrixas((s) => applyUnique(s));
    if (modal === "linha") setLinhas((s) => applyUnique(s));
    if (modal === "graduacao") setGraduacoes((s) => applyUnique(s));
    if (modal === "cargos") setCargos((s) => applyUnique(s));

    setModal(null);
  }

  function removeItem(kind: Exclude<ModalKind, null>, idx: number) {
    if (kind === "orixas") setOrixas((s) => s.filter((_, i) => i !== idx));
    if (kind === "linha") setLinhas((s) => s.filter((_, i) => i !== idx));
    if (kind === "graduacao") setGraduacoes((s) => s.filter((_, i) => i !== idx));
    if (kind === "cargos") setCargos((s) => s.filter((_, i) => i !== idx));
  }

  const quickCard = (
    <aside className="tercfg__side">
      <div className="tercfg__logoCard">
        <div className="tercfg__logoHead">
          <div>
            <div className="tercfg__sideTitle">Terreiro</div>
            <div className="muted">Configurações gerais</div>
          </div>
          <span className="tercfg__pill">UI</span>
        </div>

        <div className="tercfg__logoBox">
          <div className="tercfg__logoPlaceholder">Clique para enviar logo</div>
        </div>

        <div className="tercfg__mini">
          <div className="tercfg__miniLabel">Administradores</div>
          <div className="tercfg__miniRow">
            <span className="tercfg__miniLevel">Nível 1</span>
            <span className="tercfg__miniName">{form.responsavel || "—"}</span>
          </div>
        </div>
      </div>

      <div className="tercfg__sideInfo">
        <div className="muted">Dica</div>
        <div className="tercfg__sideInfoText">
          O que você cadastrar aqui (Orixás, Linhas, Graduação e Cargos) vai servir de “qualificador”
          nas telas de Membros e Giras depois.
        </div>
      </div>
    </aside>
  );

  return (
    <div className="tercfg">
      <div className="tercfg__head">
        <div>
          <h1 className="appTitle">Configurações • Terreiro</h1>
          <p className="muted">
            Ajuste os dados básicos do terreiro e cadastre os qualificadores usados no restante do app.
          </p>
        </div>

        <div className="tercfg__actions">
          <button className="btn btn--ghost" type="button">
            Cancelar
          </button>
          <button className="btn btn--primary" type="button">
            Salvar
          </button>
        </div>
      </div>

      <div className="tercfg__grid">
        {quickCard}

        <section className="tercfg__main">
          <div className="tercfg__tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={["tercfg__tab", active === t.key ? "isActive" : ""].join(" ")}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tercfg__panel">
            {active === "terreiro" && (
              <div className="tercfg__panelInner">
                <div className="tercfg__sectionTitle">Dados do terreiro</div>

                <div className="tercfg__formGrid">
                  <Field label="Nome do Terreiro">
                    <input value={form.nome} onChange={(e) => setField("nome", e.target.value)} />
                  </Field>

                  <Field label="Razão Social">
                    <input
                      value={form.razaoSocial}
                      onChange={(e) => setField("razaoSocial", e.target.value)}
                      placeholder="(se tiver)"
                    />
                  </Field>

                  <Field label="CNPJ">
                    <input value={form.cnpj} onChange={(e) => setField("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
                  </Field>

                  <Field label="Data Fundação">
                    <input value={form.dataFundacao} onChange={(e) => setField("dataFundacao", e.target.value)} placeholder="dd/mm/aaaa" />
                  </Field>

                  <Field label="Nome do Responsável">
                    <input value={form.responsavel} onChange={(e) => setField("responsavel", e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {active === "contato" && (
              <div className="tercfg__panelInner">
                <div className="tercfg__sectionTitle">Contato</div>

                <div className="tercfg__formGrid">
                  <Field label="WhatsApp">
                    <input value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} placeholder="(92) 9xxxx-xxxx" />
                  </Field>

                  <Field label="Telefone">
                    <input value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} placeholder="(92) xxxx-xxxx" />
                  </Field>

                  <Field label="Email">
                    <input value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="contato@..." />
                  </Field>
                </div>

                <div className="tercfg__hint">
                  <span className="tercfg__hintDot" />
                  Esses dados serão usados em comunicados, confirmações e contato rápido.
                </div>
              </div>
            )}

            {active === "endereco" && (
              <div className="tercfg__panelInner">
                <div className="tercfg__sectionTitle">Endereço</div>

                <div className="tercfg__formGrid">
                  <Field label="CEP">
                    <input value={form.cep} onChange={(e) => setField("cep", e.target.value)} placeholder="00000-000" />
                  </Field>

                  <Field label="Logradouro">
                    <input value={form.logradouro} onChange={(e) => setField("logradouro", e.target.value)} />
                  </Field>

                  <Field label="Número">
                    <input value={form.numero} onChange={(e) => setField("numero", e.target.value)} />
                  </Field>

                  <Field label="Complemento">
                    <input value={form.complemento} onChange={(e) => setField("complemento", e.target.value)} placeholder="(opcional)" />
                  </Field>

                  <Field label="Bairro">
                    <input value={form.bairro} onChange={(e) => setField("bairro", e.target.value)} />
                  </Field>

                  <Field label="Cidade">
                    <input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
                  </Field>

                  <Field label="Estado">
                    <input value={form.estado} onChange={(e) => setField("estado", e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {active === "orixas" && (
              <ListPanel
                title="Orixás"
                subtitle="Cadastre os orixás que a casa utiliza como referência."
                buttonLabel="+ Adicionar Orixá"
                items={orixas}
                onAdd={() => openAdd("orixas")}
                onRemove={(idx) => removeItem("orixas", idx)}
              />
            )}

            {active === "linha" && (
              <ListPanel
                title="Linhas"
                subtitle="Linhas de trabalho (ex.: Pretos Velhos, Caboclos, Exus...)."
                buttonLabel="+ Adicionar Linha"
                items={linhas}
                onAdd={() => openAdd("linha")}
                onRemove={(idx) => removeItem("linha", idx)}
              />
            )}

            {active === "graduacao" && (
              <ListPanel
                title="Graduação"
                subtitle="Defina níveis/graduações usados para médiuns e funções."
                buttonLabel="+ Adicionar Graduação"
                items={graduacoes}
                onAdd={() => openAdd("graduacao")}
                onRemove={(idx) => removeItem("graduacao", idx)}
              />
            )}

            {active === "cargos" && (
              <ListPanel
                title="Cargos e funções"
                subtitle="Cadastro de cargos para qualificar membros e responsabilidades."
                buttonLabel="+ Adicionar cargo/função"
                items={cargos}
                onAdd={() => openAdd("cargos")}
                onRemove={(idx) => removeItem("cargos", idx)}
              />
            )}

            {active === "pix" && (
              <div className="tercfg__panelInner">
                <div className="tercfg__sectionTitle">Chave Pix</div>

                <div className="tercfg__formGrid">
                  <Field label="Tipo de chave">
                    <select value={form.pixTipo} onChange={(e) => setField("pixTipo", e.target.value)}>
                      <option>CPF/CNPJ</option>
                      <option>Telefone</option>
                      <option>Email</option>
                      <option>Aleatória</option>
                    </select>
                  </Field>

                  <Field label="Chave">
                    <input value={form.pixChave} onChange={(e) => setField("pixChave", e.target.value)} placeholder="Digite a chave Pix" />
                  </Field>

                  <Field label="Favorecido">
                    <input value={form.pixNomeFavorecido} onChange={(e) => setField("pixNomeFavorecido", e.target.value)} placeholder="Nome do favorecido" />
                  </Field>

                  <Field label="Banco (opcional)">
                    <input value={form.pixBanco} onChange={(e) => setField("pixBanco", e.target.value)} placeholder="Banco / Agência / Conta" />
                  </Field>
                </div>

                <div className="tercfg__hint">
                  <span className="tercfg__hintDot" />
                  Essa informação pode ser usada na tela de Arrecadação e em comunicados.
                </div>
              </div>
            )}

            {active === "orientacoes" && (
              <div className="tercfg__panelInner">
                <div className="tercfg__sectionTitle">Orientações</div>
                <p className="muted" style={{ marginTop: 0 }}>
                  Texto padrão para orientar novos membros/consulentes (ex.: regras, horário, vestimenta).
                </p>

                <textarea
                  className="tercfg__textarea"
                  value={form.orientacoes}
                  onChange={(e) => setField("orientacoes", e.target.value)}
                  placeholder="Escreva aqui as orientações..."
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {modal && (
        <Modal
          title={`Cadastrar ${slugLabel(modal)}`}
          onClose={() => setModal(null)}
          onConfirm={addItem}
          confirmLabel="Salvar"
        >
          <div className="tercfg__modalField">
            <label>{slugLabel(modal)}</label>
            <input
              autoFocus
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              placeholder={`Digite ${slugLabel(modal).toLowerCase()}...`}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="tercfg__field">
      <div className="tercfg__label">{label}</div>
      {children}
    </div>
  );
}

function ListPanel({
  title,
  subtitle,
  buttonLabel,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  items: string[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="tercfg__panelInner">
      <div className="tercfg__sectionTitle">{title}</div>
      <p className="muted" style={{ marginTop: 0 }}>{subtitle}</p>

      <div className="tercfg__listTop">
        <button className="btn btn--primary" type="button" onClick={onAdd}>
          {buttonLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="tercfg__empty">
          <div className="tercfg__emptyIcon">📁</div>
          <div className="tercfg__emptyTitle">Nenhum resultado encontrado</div>
          <div className="muted">Cadastre itens para usar como referência no sistema.</div>
        </div>
      ) : (
        <div className="tercfg__list">
          {items.map((it, idx) => (
            <div key={`${it}-${idx}`} className="tercfg__row">
              <div className="tercfg__rowName">{it}</div>
              <button className="tercfg__remove" type="button" onClick={() => onRemove(idx)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="tercfg__modalBackdrop" role="dialog" aria-modal="true">
      <div className="tercfg__modal">
        <div className="tercfg__modalHead">
          <div className="tercfg__modalTitle">{title}</div>
          <button className="tercfg__modalClose" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="tercfg__modalBody">{children}</div>

        <div className="tercfg__modalActions">
          <button className="btn btn--ghost" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn--primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
