"use client";

import { useMemo, useState } from "react";

type Medium = { id: string; nome: string; sobrenome: string; celular: string; ativo: boolean };

export default function MediunsList() {
  const [q, setQ] = useState("");
  const [data] = useState<Medium[]>([]); // MVP: vazio

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((m) =>
      `${m.id} ${m.nome} ${m.sobrenome} ${m.celular}`.toLowerCase().includes(t)
    );
  }, [q, data]);

  return (
    <div className="page">
      <div className="listTop">
        <div>
          <h1 className="listTitle">Médium</h1>
        </div>

        <button className="btnPrimary">+ Adicionar médium</button>
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

        <button className="btnGhost">Exportar</button>
        <button className="btnGhost">Filtro avançado</button>
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
    </div>
  );
}
