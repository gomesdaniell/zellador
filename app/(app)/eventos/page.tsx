"use client";

import { useMemo, useState } from "react";

type EventoStatus = "Ativo" | "Pendente" | "Concluído" | "Cancelado";

type EventoItem = {
  id: string;
  dataEvento: string; // yyyy-mm-dd
  nomeEvento: string;
  status: EventoStatus;
  horaInicio: string; // HH:MM
  horaTermino: string; // HH:MM
  valor: string; // texto (ex: 50,00) - UI only
  para: string;
  coordenador: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function EventosPage() {
  const [items, setItems] = useState<EventoItem[]>([]);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const [mesAno, setMesAno] = useState(() => {
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${y}-${m}`; // yyyy-mm
  });

  const [form, setForm] = useState<EventoItem>({
    id: "",
    dataEvento: "",
    nomeEvento: "",
    status: "Pendente",
    horaInicio: "",
    horaTermino: "",
    valor: "",
    para: "",
    coordenador: "",
  });

  const filtered = useMemo(() => {
    if (!mesAno) return items;
    return items.filter((it) => (it.dataEvento || "").slice(0, 7) === mesAno);
  }, [items, mesAno]);

  function openModal() {
    setForm({
      id: "",
      dataEvento: "",
      nomeEvento: "",
      status: "Pendente",
      horaInicio: "",
      horaTermino: "",
      valor: "",
      para: "",
      coordenador: "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function save() {
    if (!form.dataEvento || !form.nomeEvento) {
      alert("Preencha pelo menos: Data do Evento e Nome do Evento.");
      return;
    }

    const next: EventoItem = { ...form, id: uid() };
    setItems((prev) => [next, ...prev]);
    setOpen(false);
  }

  return (
    <div className="evt">
      <div className="evt__head">
        <h1 className="appTitle">Eventos</h1>

        <div className="evt__actions">
          <div className="evt__monthPill">
            <button
              className="evt__pillBtn"
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

            <div className="evt__pillCenter">
              {formatMesAno(mesAno)}
              <input
                className="evt__monthInput"
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                aria-label="Selecionar mês"
              />
            </div>

            <button
              className="evt__pillBtn"
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

          <button className="evt__filterBtn" type="button">
            Filtrar
          </button>
        </div>
      </div>

      <div className="evt__toolbar">
        <button className="evt__primary" type="button" onClick={openModal}>
          + Cadastrar evento
        </button>
      </div>

      <div className="evt__card">
        <div className="evt__table">
          <div className="evt__thead">
            <div>Data</div>
            <div>Nome do Evento</div>
            <div>Status</div>
            <div>Horário</div>
            <div>Valor</div>
            <div>Para</div>
            <div>Coordenador</div>
          </div>

          {filtered.length === 0 ? (
            <div className="evt__empty">
              <div className="evt__emptyTitle">Nenhum registro encontrado</div>
              <div className="muted">Clique em “+ Cadastrar evento” para criar o primeiro.</div>
            </div>
          ) : (
            <div className="evt__tbody">
              {filtered.map((it) => (
                <div key={it.id} className="evt__tr">
                  <div className="evt__strong">{formatDate(it.dataEvento)}</div>
                  <div className="evt__strong">{it.nomeEvento}</div>
                  <div>
                    <span className={`evt__badge evt__badge--${badgeKey(it.status)}`}>{it.status}</span>
                  </div>
                  <div>
                    {it.horaInicio || "—"}
                    {it.horaTermino ? ` • ${it.horaTermino}` : ""}
                  </div>
                  <div>{it.valor ? `R$ ${it.valor}` : "—"}</div>
                  <div>{it.para || "—"}</div>
                  <div>{it.coordenador || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="evt__overlay" role="dialog" aria-modal="true" aria-label="Cadastrar evento">
          <div className="evt__modal">
            <div className="evt__modalHead">
              <div className="evt__modalTitle">Cadastrar evento</div>
              <button className="evt__x" type="button" onClick={closeModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="evt__modalBody">
              <div className="evt__grid3">
                <div className="evt__field">
                  <label>Data do Evento</label>
                  <input
                    type="date"
                    value={form.dataEvento}
                    onChange={(e) => setForm((p) => ({ ...p, dataEvento: e.target.value }))}
                  />
                </div>

                <div className="evt__field">
                  <label>Nome do Evento</label>
                  <input
                    value={form.nomeEvento}
                    onChange={(e) => setForm((p) => ({ ...p, nomeEvento: e.target.value }))}
                    placeholder="Nome do Evento"
                  />
                </div>

                <div className="evt__field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventoStatus }))}
                  >
                    <option value="Pendente">Selecionar status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="evt__grid3">
                <div className="evt__field">
                  <label>Hora Início</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))}
                  />
                </div>

                <div className="evt__field">
                  <label>Hora Término</label>
                  <input
                    type="time"
                    value={form.horaTermino}
                    onChange={(e) => setForm((p) => ({ ...p, horaTermino: e.target.value }))}
                  />
                </div>

                <div className="evt__field">
                  <label>Valor R$</label>
                  <input
                    value={form.valor}
                    onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                    placeholder="Valor R$"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="evt__grid2">
                <div className="evt__field">
                  <label>Para</label>
                  <input
                    value={form.para}
                    onChange={(e) => setForm((p) => ({ ...p, para: e.target.value }))}
                    placeholder="Evento para"
                  />
                </div>

                <div className="evt__field">
                  <label>Coordenador</label>
                  <input
                    value={form.coordenador}
                    onChange={(e) => setForm((p) => ({ ...p, coordenador: e.target.value }))}
                    placeholder="Coordenador"
                  />
                </div>
              </div>
            </div>

            <div className="evt__modalFoot">
              <button className="evt__ghost" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="evt__save" type="button" onClick={save}>
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

function badgeKey(status: EventoStatus) {
  switch (status) {
    case "Ativo":
      return "ok";
    case "Concluído":
      return "done";
    case "Cancelado":
      return "bad";
    default:
      return "wait";
  }
}
