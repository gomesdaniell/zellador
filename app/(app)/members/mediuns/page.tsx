"use client";

import { useEffect, useMemo, useState } from "react";

type Medium = {
  id: string;
  nome: string;
  sobrenome: string;
  celular: string;
  ativo: boolean;
};

const LS_KEY = "zellador:mediuns:v1";

function uid() {
  return Math.random().toString(16).slice(2, 10).toUpperCase();
}

export default function MediunsPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Medium[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // form
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [celular, setCelular] = useState("");
  const [ativo, setAtivo] = useState(true);

  // carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  // salvar no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  // fechar modal com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((m) =>
      `${m.id} ${m.nome} ${m.sobrenome} ${m.celular}`.toLowerCase().includes(t)
    );
  }, [q, data]);

  function openModal() {
    setNome("");
    setSobrenome("");
    setCelular("");
    setAtivo(true);
    setModalOpen(true);
  }

  function submit() {
    if (!nome.trim()) return alert("Informe o nome.");
    if (!celular.trim()) return alert("Informe o celular.");

    const item: Medium = {
      id: uid(),
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      celular: celular.trim(),
      ativo,
    };

    setData((prev) => [item, ...prev]);
    setModalOpen(false);
  }

  function exportCsv() {
    const rows = filtered.map((m) => ({
      idCad: m.id,
      nome: m.nome,
      sobrenome: m.sobrenome,
      celular: m.celular,
      ativo: m.ativo ? "Sim" : "Não",
    }));

    const header = Object.keys(rows[0] || { idCad: "", nome: "", sobrenome: "", celular: "", ativo: "" });
    const csv =
      header.join(";") +
      "\n" +
      rows.map((r) => header.map((h) => String((r as any)[h] ?? "")).join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mediuns.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="listTop">
        <h1 className="listTitle">Médium</h1>
        <button className="btnPrimary" onClick={openModal}>
          + Adicionar médium
        </button>
      </div>

      <div className="listActions">
        <div className="searchBox">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Faça a busca por id_Cad, nome, sobrenome e celular"
          />
          <span className="searchIcon">🔍</span>
        </div>

        <button className="btnGhost" onClick={exportCsv} disabled={filtered.length === 0}>
          Exportar
        </button>

        <button className="btnGhost" onClick={() => alert("Filtro avançado (MVP): em breve")}>
          Filtro avançado
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">🗂️</div>
          <div className="emptyTitle">Nenhum resultado encontrado</div>
          <div className="emptyText">
            Tente ajustar seus filtros de pesquisa para encontrar o que procura.
          </div>
        </div>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>id_Cad</th>
                <th>Nome</th>
                <th>Sobrenome</th>
                <th>Celular</th>
                <th>Ativo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nome}</td>
                  <td>{m.sobrenome}</td>
                  <td>{m.celular}</td>
                  <td>{m.ativo ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modalOverlay" onMouseDown={() => setModalOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2 className="modalTitle">Adicionar médium</h2>
              <button className="modalClose" onClick={() => setModalOpen(false)} aria-label="Fechar">
                ✕
              </button>
            </div>

            <div className="modalBody">
              <div className="formRow">
                <div className="field">
                  <label>Nome *</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: João" />
                </div>

                <div className="field">
                  <label>Sobrenome</label>
                  <input
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    placeholder="Ex.: Silva"
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="field">
                  <label>Celular *</label>
                  <input
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="Ex.: (92) 99999-9999"
                  />
                </div>

                <div className="field">
                  <label>Ativo?</label>
                  <select value={ativo ? "sim" : "nao"} onChange={(e) => setAtivo(e.target.value === "sim")}>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modalFooter">
              <button className="btnGhost" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="btnPrimary" onClick={submit}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
