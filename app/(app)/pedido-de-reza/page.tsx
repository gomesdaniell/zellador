"use client";

import { useMemo, useState } from "react";

type Categoria = "Saúde" | "Família" | "Financeiro" | "Proteção" | "Espiritual" | "Outros";
type Status = "Aberto" | "Em andamento" | "Concluído" | "Arquivado";
type Prioridade = "Baixa" | "Normal" | "Alta";

type PedidoReza = {
  id: string;
  titulo: string;
  pedido: string;
  categoria: Categoria;
  prioridade: Prioridade;
  visibilidade: "Privado" | "Corrente";
  dataLimite: string; // YYYY-MM-DD
  criadoEm: string; // ISO
  criadoPor: string; // depois plugamos no usuário
  status: Status;
};

function uid() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`) as string;
}

function isoToBR(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysYMD(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isVencido(ymd: string) {
  return ymd < todayYMD();
}

const CATEGORIAS: Categoria[] = ["Saúde", "Família", "Financeiro", "Proteção", "Espiritual", "Outros"];
const STATUSES: Status[] = ["Aberto", "Em andamento", "Concluído", "Arquivado"];
const PRIORIDADES: Prioridade[] = ["Baixa", "Normal", "Alta"];

export default function PedidoDeRezaPage() {
  // Mock inicial (MVP)
  const [items, setItems] = useState<PedidoReza[]>(() => [
    {
      id: uid(),
      titulo: "Saúde da família",
      pedido: "Peço firmeza e equilíbrio para minha casa e saúde para minha mãe.",
      categoria: "Saúde",
      prioridade: "Normal",
      visibilidade: "Privado",
      dataLimite: addDaysYMD(14),
      criadoEm: new Date().toISOString(),
      criadoPor: "Daniel Gomes",
      status: "Aberto",
    },
  ]);

  // Filtros
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState<Status | "Todos">("Aberto");
  const [fCategoria, setFCategoria] = useState<Categoria | "Todos">("Todos");
  const [fVencido, setFVencido] = useState<"Todos" | "Somente vencidos" | "Somente válidos">("Somente válidos");

  // Modal criar
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [pedido, setPedido] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Saúde");
  const [prioridade, setPrioridade] = useState<Prioridade>("Normal");
  const [visibilidade, setVisibilidade] = useState<"Privado" | "Corrente">("Privado");
  const [dataLimite, setDataLimite] = useState(addDaysYMD(14));
  const [erros, setErros] = useState<{ titulo?: string; pedido?: string; dataLimite?: string }>({});

  function abrir() {
    setTitulo("");
    setPedido("");
    setCategoria("Saúde");
    setPrioridade("Normal");
    setVisibilidade("Privado");
    setDataLimite(addDaysYMD(14));
    setErros({});
    setOpen(true);
  }

  function fechar() {
    setOpen(false);
  }

  function validar() {
    const e: typeof erros = {};
    if (!titulo.trim()) e.titulo = "Informe um título";
    if (!pedido.trim()) e.pedido = "Descreva o pedido";
    if (!dataLimite) e.dataLimite = "Defina uma data limite";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function criar() {
    if (!validar()) return;

    const novo: PedidoReza = {
      id: uid(),
      titulo: titulo.trim(),
      pedido: pedido.trim(),
      categoria,
      prioridade,
      visibilidade,
      dataLimite,
      criadoEm: new Date().toISOString(),
      criadoPor: "Usuário (mock)",
      status: "Aberto",
    };

    setItems((s) => [novo, ...s]);
    fechar();
  }

  function setStatus(id: string, status: Status) {
    setItems((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  function remover(id: string) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  const filtrado = useMemo(() => {
    const term = q.trim().toLowerCase();

    return items.filter((it) => {
      const venc = isVencido(it.dataLimite);

      const okVenc =
        fVencido === "Todos" ? true : fVencido === "Somente vencidos" ? venc : !venc;

      const okStatus = fStatus === "Todos" ? true : it.status === fStatus;
      const okCat = fCategoria === "Todos" ? true : it.categoria === fCategoria;

      const okQ =
        !term ||
        it.titulo.toLowerCase().includes(term) ||
        it.pedido.toLowerCase().includes(term) ||
        it.criadoPor.toLowerCase().includes(term);

      return okVenc && okStatus && okCat && okQ;
    });
  }, [items, q, fStatus, fCategoria, fVencido]);

  const kpiAbertos = useMemo(() => items.filter((x) => x.status === "Aberto").length, [items]);
  const kpiEmAnd = useMemo(() => items.filter((x) => x.status === "Em andamento").length, [items]);
  const kpiVencidos = useMemo(() => items.filter((x) => isVencido(x.dataLimite) && x.status !== "Arquivado").length, [items]);

  return (
    <div className="rezas">
      <div className="rezas__head">
        <div>
          <h1 className="appTitle">Pedido de reza</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Cadastre pedidos e acompanhe por status e prazo (evita backlog).
          </p>

          <div className="rezas__kpis">
            <div className="kpi">
              <div className="kpi__label">Abertos</div>
              <div className="kpi__value">{kpiAbertos}</div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Em andamento</div>
              <div className="kpi__value">{kpiEmAnd}</div>
            </div>
            <div className="kpi">
              <div className="kpi__label">Vencidos</div>
              <div className="kpi__value">{kpiVencidos}</div>
            </div>
          </div>
        </div>

        <button className="rezas__primary" type="button" onClick={abrir}>
          + Novo pedido
        </button>
      </div>

      <div className="rezas__toolbar">
        <div className="rezas__filters">
          <div className="rezas__select">
            <span className="rezas__selectLabel">Status</span>
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value as Status | "Todos")}>
              <option value="Todos">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="rezas__select">
            <span className="rezas__selectLabel">Categoria</span>
            <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value as Categoria | "Todos")}>
              <option value="Todos">Todos</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="rezas__select">
            <span className="rezas__selectLabel">Prazo</span>
            <select value={fVencido} onChange={(e) => setFVencido(e.target.value as any)}>
              <option value="Somente válidos">Somente válidos</option>
              <option value="Somente vencidos">Somente vencidos</option>
              <option value="Todos">Todos</option>
            </select>
          </div>
        </div>

        <div className="rezas__search">
          <span className="rezas__searchIcon">🔎</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título ou texto..." />
        </div>
      </div>

      {filtrado.length === 0 ? (
        <div className="rezas__empty">
          <div className="rezas__emptyTitle">Nenhum pedido encontrado</div>
          <div className="muted">Crie um pedido novo ou ajuste os filtros.</div>
        </div>
      ) : (
        <div className="rezas__grid">
          {filtrado.map((it) => {
            const venc = isVencido(it.dataLimite);
            return (
              <div key={it.id} className={`rezas__card ${it.status === "Arquivado" ? "isArchived" : ""}`}>
                <div className="rezas__cardTop">
                  <span className={`rezas__pill ${venc ? "vencido" : ""}`}>
                    {it.categoria} • {it.prioridade}{venc ? " • Vencido" : ""}
                  </span>
                  <span className={`rezas__badge ${it.status === "Aberto" ? "ok" : it.status === "Em andamento" ? "warn" : "muted"}`}>
                    {it.status}
                  </span>
                </div>

                <div className="rezas__title">{it.titulo}</div>
                <div className="rezas__text">{it.pedido}</div>

                <div className="rezas__meta">
                  <span>Limite: <b>{it.dataLimite.split("-").reverse().join("/")}</b></span>
                  <span className="dot">•</span>
                  <span>Criado: {isoToBR(it.criadoEm)}</span>
                </div>

                <div className="rezas__meta muted" style={{ marginTop: -4 }}>
                  <span>Visibilidade: {it.visibilidade}</span>
                  <span className="dot">•</span>
                  <span>Por: {it.criadoPor}</span>
                </div>

                <div className="rezas__actions">
                  <select
                    className="rezas__inlineSelect"
                    value={it.status}
                    onChange={(e) => setStatus(it.id, e.target.value as Status)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button className="rezas__btn rezas__btn--danger" type="button" onClick={() => remover(it.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="rezas__overlay" role="dialog" aria-modal="true" aria-label="Novo pedido de reza">
          <div className="rezas__modal">
            <div className="rezas__modalHead">
              <div className="rezas__modalTitle">Novo pedido</div>
              <button className="rezas__x" type="button" onClick={fechar} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="rezas__modalBody">
              <div className="rezas__row">
                <div className="rezas__field grow">
                  <label>Título</label>
                  <input
                    className={erros.titulo ? "hasErr" : ""}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Saúde da minha mãe"
                  />
                  {erros.titulo && <div className="rezas__err">{erros.titulo}</div>}
                </div>

                <div className="rezas__field">
                  <label>Categoria</label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rezas__row" style={{ marginTop: 10 }}>
                <div className="rezas__field">
                  <label>Prioridade</label>
                  <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
                    {PRIORIDADES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="rezas__field">
                  <label>Visibilidade</label>
                  <select value={visibilidade} onChange={(e) => setVisibilidade(e.target.value as any)}>
                    <option value="Privado">Privado (dirigente/admin)</option>
                    <option value="Corrente">Corrente (visível para a casa)</option>
                  </select>
                </div>

                <div className="rezas__field">
                  <label>Data limite</label>
                  <input
                    type="date"
                    className={erros.dataLimite ? "hasErr" : ""}
                    value={dataLimite}
                    onChange={(e) => setDataLimite(e.target.value)}
                  />
                  {erros.dataLimite && <div className="rezas__err">{erros.dataLimite}</div>}
                </div>
              </div>

              <div className="rezas__field" style={{ marginTop: 10 }}>
                <label>Pedido</label>
                <textarea
                  className={erros.pedido ? "hasErr" : ""}
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                  placeholder="Descreva o pedido de reza..."
                  rows={8}
                />
                {erros.pedido && <div className="rezas__err">{erros.pedido}</div>}
              </div>

              <div className="muted" style={{ marginTop: 10 }}>
                Dica: use a <b>data limite</b> para não virar acúmulo infinito. Depois do prazo, o pedido pode ser arquivado.
              </div>
            </div>

            <div className="rezas__modalFoot">
              <button className="rezas__ghost" type="button" onClick={fechar}>
                Cancelar
              </button>
              <button className="rezas__save" type="button" onClick={criar}>
                Criar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
