"use client";

import { useMemo, useState } from "react";

type Alvo = "MEDIUM" | "CONSULENTE" | "TODOS";
type Status = "Ativo" | "Arquivado";

type Comunicado = {
  id: string;
  alvo: Alvo;
  titulo: string;
  conteudo: string;
  criadoEm: string; // ISO
  criadoPor: string;
  status: Status;
};

function uid() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`) as string;
}

function labelAlvo(v: Alvo) {
  if (v === "MEDIUM") return "Médiuns";
  if (v === "CONSULENTE") return "Consulentes";
  return "Todos";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export default function ComunicadosPage() {
  // Lista (mock local – MVP)
  const [items, setItems] = useState<Comunicado[]>(() => [
    {
      id: uid(),
      alvo: "TODOS",
      titulo: "Bem-vindos ao Zellador",
      conteudo:
        "Este é um comunicado de exemplo. Aqui você vai publicar avisos, orientações e lembretes para a casa. Depois a gente conecta no banco.",
      criadoEm: new Date().toISOString(),
      criadoPor: "Daniel Gomes",
      status: "Ativo",
    },
  ]);

  // Filtros
  const [fAlvo, setFAlvo] = useState<Alvo | "Todos">("Todos");
  const [fStatus, setFStatus] = useState<Status | "Todos">("Todos");
  const [busca, setBusca] = useState("");

  // Modal + form
  const [open, setOpen] = useState(false);
  const [alvo, setAlvo] = useState<Alvo>("TODOS");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erros, setErros] = useState<{ alvo?: string; titulo?: string; conteudo?: string }>({});

  function abrirModal() {
    setAlvo("TODOS");
    setTitulo("");
    setConteudo("");
    setErros({});
    setOpen(true);
  }

  function fecharModal() {
    setOpen(false);
  }

  function validar() {
    const e: typeof erros = {};
    if (!alvo) e.alvo = "Selecione o público";
    if (!titulo.trim()) e.titulo = "Digite um título";
    if (!conteudo.trim()) e.conteudo = "Digite o texto do comunicado";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function criarComunicado() {
    if (!validar()) return;

    const novo: Comunicado = {
      id: uid(),
      alvo,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      criadoEm: new Date().toISOString(),
      criadoPor: "Daniel Gomes", // depois liga no usuário logado
      status: "Ativo",
    };

    setItems((s) => [novo, ...s]);
    fecharModal();
  }

  function alternarArquivo(id: string) {
    setItems((s) =>
      s.map((x) =>
        x.id === id ? { ...x, status: x.status === "Ativo" ? "Arquivado" : "Ativo" } : x
      )
    );
  }

  function excluir(id: string) {
    setItems((s) => s.filter((x) => x.id !== id));
  }

  const filtrado = useMemo(() => {
    const b = busca.trim().toLowerCase();

    return items.filter((it) => {
      const okAlvo = fAlvo === "Todos" ? true : it.alvo === fAlvo;
      const okStatus = fStatus === "Todos" ? true : it.status === fStatus;

      const okBusca =
        !b ||
        it.titulo.toLowerCase().includes(b) ||
        it.conteudo.toLowerCase().includes(b) ||
        labelAlvo(it.alvo).toLowerCase().includes(b);

      return okAlvo && okStatus && okBusca;
    });
  }, [items, fAlvo, fStatus, busca]);

  return (
    <div className="comms">
      {/* Header */}
      <div className="comms__head">
        <div>
          <h1 className="appTitle">Comunicados</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Crie avisos e orientações para a casa.
          </p>
        </div>

        <button className="comms__primary" type="button" onClick={abrirModal}>
          + Novo comunicado
        </button>
      </div>

      {/* Toolbar */}
      <div className="comms__toolbar">
        <div className="comms__filters">
          <div className="comms__select">
            <span className="comms__selectLabel">Público</span>
            <select value={fAlvo} onChange={(e) => setFAlvo(e.target.value as Alvo | "Todos")}>
              <option value="Todos">Todos</option>
              <option value="MEDIUM">Médiuns</option>
              <option value="CONSULENTE">Consulentes</option>
              <option value="TODOS">Todos (alvo)</option>
            </select>
          </div>

          <div className="comms__select">
            <span className="comms__selectLabel">Status</span>
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value as Status | "Todos")}>
              <option value="Todos">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </div>
        </div>

        <div className="comms__search">
          <span className="comms__searchIcon">🔎</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou conteúdo..."
          />
        </div>
      </div>

      {/* Lista em cards */}
      {filtrado.length === 0 ? (
        <div className="comms__empty">
          <div className="comms__emptyTitle">Nenhum comunicado encontrado</div>
          <div className="muted">Clique em “+ Novo comunicado” para criar o primeiro.</div>
        </div>
      ) : (
        <div className="comms__grid">
          {filtrado.map((it) => (
            <div key={it.id} className={`comms__card ${it.status === "Arquivado" ? "isArchived" : ""}`}>
              <div className="comms__cardTop">
                <span className="comms__pill">{labelAlvo(it.alvo)}</span>
                <span className={`comms__badge ${it.status === "Ativo" ? "ok" : "muted"}`}>{it.status}</span>
              </div>

              <div className="comms__title">{it.titulo}</div>
              <div className="comms__text">{it.conteudo}</div>

              <div className="comms__meta">
                <span>
                  Por <b>{it.criadoPor}</b>
                </span>
                <span className="dot">•</span>
                <span>{fmtDate(it.criadoEm)}</span>
              </div>

              <div className="comms__actions">
                <button className="comms__btn" type="button" onClick={() => alternarArquivo(it.id)}>
                  {it.status === "Ativo" ? "Arquivar" : "Reativar"}
                </button>
                <button className="comms__btn comms__btn--danger" type="button" onClick={() => excluir(it.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="comms__overlay" role="dialog" aria-modal="true" aria-label="Novo comunicado">
          <div className="comms__modal">
            <div className="comms__modalHead">
              <div className="comms__modalTitle">Novo comunicado</div>
              <button className="comms__x" type="button" onClick={fecharModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="comms__modalBody">
              <div className="comms__row">
                <div className="comms__field">
                  <label>Público</label>
                  <select
                    className={erros.alvo ? "hasErr" : ""}
                    value={alvo}
                    onChange={(e) => setAlvo(e.target.value as Alvo)}
                  >
                    <option value="MEDIUM">Médiuns</option>
                    <option value="CONSULENTE">Consulentes</option>
                    <option value="TODOS">Todos</option>
                  </select>
                  {erros.alvo && <div className="comms__err">{erros.alvo}</div>}
                </div>

                <div className="comms__field grow">
                  <label>Título</label>
                  <input
                    className={erros.titulo ? "hasErr" : ""}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Orientações para a gira de sábado"
                  />
                  {erros.titulo && <div className="comms__err">{erros.titulo}</div>}
                </div>
              </div>

              <div className="comms__field" style={{ marginTop: 10 }}>
                <label>Mensagem</label>
                <textarea
                  className={erros.conteudo ? "hasErr" : ""}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Digite o comunicado..."
                  rows={8}
                />
                {erros.conteudo && <div className="comms__err">{erros.conteudo}</div>}
              </div>
            </div>

            <div className="comms__modalFoot">
              <button className="comms__ghost" type="button" onClick={fecharModal}>
                Cancelar
              </button>
              <button className="comms__save" type="button" onClick={criarComunicado}>
                Criar comunicado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
