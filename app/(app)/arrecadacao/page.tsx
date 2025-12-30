"use client";

import { useMemo, useState } from "react";

type ArrecStatus = "Confirmado" | "Pendente" | "Concluído" | "Cancelado";

type ArrecItem = {
  id: string;
  nome: string;
  coordenador: string;
  status: ArrecStatus;

  dataInicio: string; // yyyy-mm-dd
  dataTermino: string; // yyyy-mm-dd
  dataEntrega: string; // yyyy-mm-dd
  horaEntrega: string; // HH:MM

  valor: string; // texto (ex: 50,00) - UI only
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function ArrecadacaoPage() {
  const [items, setItems] = useState<ArrecItem[]>([]);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const [mesAno, setMesAno] = useState(() => {
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${y}-${m}`; // yyyy-mm
  });

  const [form, setForm] = useState<ArrecItem>({
    id: "",
    nome: "",
    coordenador: "",
    status: "Confirmado",
    dataInicio: "",
    dataTermino: "",
    dataEntrega: "",
    horaEntrega: "",
    valor: "",
  });

  const filtered = useMemo(() => {
    if (!mesAno) return items;
    // Filtro por mês usando "Data início" (igual comportamento simples do MVP)
    return items.filter((it) => (it.dataInicio || "").slice(0, 7) === mesAno);
  }, [items, mesAno]);

  function openModal() {
    setForm({
      id: "",
      nome: "",
      coordenador: "",
      status: "Confirmado",
      dataInicio: "",
      dataTermino: "",
      dataEntrega: "",
      horaEntrega: "",
      valor: "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function save() {
    if (!form.nome || !form.dataInicio) {
      alert("Preencha pelo menos: Nome da Arrecadação e Data início.");
      return;
    }
    const next: ArrecItem = { ...form, id: uid() };
    setItems((prev) => [next, ...prev]);
    setOpen(false);
  }

  return (
    <div className="arr">
      <div className="arr__head">
        <h1 className="appTitle">Arrecadação</h1>

        <div className="arr__actions">
          <div className="arr__monthPill">
            <button
              className="arr__pillBtn"
              type="button"
              onClick={() => {
                const [y, m] = mesAno.split("-").map(Number);
                const d = new Date(y, m - 1, 1);
                d.setMonth(d.getMonth() - 1);
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                setMesAno(`${d.getFullYear()}-${mm}`);
              }}
              aria-label="Mês anterior"
            >
              ‹
            </button>

            <div className="arr__pillCenter">
              {formatMesAno(mesAno)}
              <input
                className="arr__monthInput"
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                aria-label="Selecionar mês"
              />
            </div>

            <button
              className="arr__pillBtn"
              type="button"
              onClick={() => {
                const [y, m] = mesAno.split("-").map(Number);
                const d = new Date(y, m - 1, 1);
                d.setMonth(d.getMonth() + 1);
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                setMesAno(`${d.getFullYear()}-${mm}`);
              }}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </div>

          <button className="arr__filterBtn" type="button">
            Filtrar
          </button>
        </div>
      </div>

      <div className="arr__toolbar">
        <button className="arr__primary" type="button" onClick={openModal}>
          + Cadastrar arrecadação
        </button>
      </div>

      <div className="arr__card">
        <div className="arr__table">
          <div className="arr__thead">
            <div>Nome</div>
            <div>Coordenador</div>
            <div>Status</div>
            <div>Data início</div>
            <div>Data término</div>
            <div>Entrega</div>
            <div>Valor</div>
          </div>

          {filtered.length === 0 ? (
            <div className="arr__empty">
              <div className="arr__emptyTitle">Nenhum registro encontrado</div>
              <div className="muted">Clique em “+ Cadastrar arrecadação” para criar o primeiro.</div>
            </div>
          ) : (
            <div className="arr__tbody">
              {filtered.map((it) => (
                <div key={it.id} className="arr__tr">
                  <div className="arr__strong">{it.nome}</div>
                  <div>{it.coordenador || "—"}</div>
                  <div>
                    <span className={`arr__badge arr__badge--${badgeKey(it.status)}`}>{it.status}</span>
                  </div>
                  <div>{formatDate(it.dataInicio)}</div>
                  <div>{formatDate(it.dataTermino)}</div>
                  <div>
                    {it.dataEntrega ? formatDate(it.dataEntrega) : "—"}
                    {it.horaEntrega ? ` • ${it.horaEntrega}` : ""}
                  </div>
                  <div>{it.valor ? `R$ ${it.valor}` : "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="arr__overlay" role="dialog" aria-modal="true" aria-label="Cadastrar arrecadação">
          <div className="arr__modal">
            <div className="arr__modalHead">
              <div className="arr__modalTitle">Cadastrar arrecadação</div>
              <button className="arr__x" type="button" onClick={closeModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="arr__modalBody">
              <div className="arr__grid3">
                <div className="arr__field">
                  <label>Nome Arrecadação</label>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                    placeholder="Ex. Roupas, Alimentos..."
                  />
                </div>

                <div className="arr__field">
                  <label>Coordenador</label>
                  <input
                    value={form.coordenador}
                    onChange={(e) => setForm((p) => ({ ...p, coordenador: e.target.value }))}
                    placeholder="Coordenador"
                  />
                </div>

                <div className="arr__field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ArrecStatus }))}
                  >
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="arr__grid2">
                <div className="arr__field">
                  <label>Data início</label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm((p) => ({ ...p, dataInicio: e.target.value }))}
                  />
                </div>

                <div className="arr__field">
                  <label>Data término</label>
                  <input
                    type="date"
                    value={form.dataTermino}
                    onChange={(e) => setForm((p) => ({ ...p, dataTermino: e.target.value }))}
                  />
                </div>
              </div>

              <div className="arr__grid2">
                <div className="arr__field">
                  <label>Data Entrega</label>
                  <input
                    type="date"
                    value={form.dataEntrega}
                    onChange={(e) => setForm((p) => ({ ...p, dataEntrega: e.target.value }))}
                  />
                </div>

                <div className="arr__field">
                  <label>Hora Entrega</label>
                  <input
                    type="time"
                    value={form.horaEntrega}
                    onChange={(e) => setForm((p) => ({ ...p, horaEntrega: e.target.value }))}
                  />
                </div>
              </div>

              <div className="arr__grid2">
                <div className="arr__field">
                  <label>Valor R$</label>
                  <input
                    value={form.valor}
                    onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="Valor R$"
                    inputMode="decimal"
                  />
                </div>

                <div />
              </div>
            </div>

            <div className="arr__modalFoot">
              <button className="arr__ghost" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="arr__save" type="button" onClick={save}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMesAno(v: string) {
  const [y, m] = v.split("-").map(Number);
  const nomes = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const mm = nomes[(m || 1) - 1] || "—";
  return `${mm}/${String(y).slice(2)}`;
}

function formatDate(v: string) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

function badgeKey(status: ArrecStatus) {
  switch (status) {
    case "Confirmado":
      return "ok";
    case "Concluído":
      return "done";
    case "Cancelado":
      return "bad";
    default:
      return "wait";
  }
}
