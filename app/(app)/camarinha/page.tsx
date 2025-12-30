"use client";

import { useMemo, useState } from "react";

type CamarinhaItem = {
  id: string;
  graduacao: string;
  coordenador: string;
  status: "Ativa" | "Pendente" | "Concluída" | "Cancelada";
  dataInicio: string; // yyyy-mm-dd
  horaInicio: string; // HH:MM
  dataTermino: string; // yyyy-mm-dd
  horaTermino: string; // HH:MM
  laos: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export default function CamarinhaPage() {
  // Mock (UI-only). Depois pluga no backend.
  const [items, setItems] = useState<CamarinhaItem[]>([]);
  const [open, setOpen] = useState(false);

  // filtro simples (igual ao print: mês/ano + botão filtrar)
  const today = new Date();
  const [mesAno, setMesAno] = useState(() => {
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${y}-${m}`; // yyyy-mm
  });

  // form state
  const [form, setForm] = useState<CamarinhaItem>({
    id: "",
    graduacao: "",
    coordenador: "",
    status: "Pendente",
    dataInicio: "",
    horaInicio: "",
    dataTermino: "",
    horaTermino: "",
    laos: "",
  });

  const filtered = useMemo(() => {
    if (!mesAno) return items;
    // filtra pelo mês/ano da dataInicio
    return items.filter((it) => (it.dataInicio || "").slice(0, 7) === mesAno);
  }, [items, mesAno]);

  function openModal() {
    setForm({
      id: "",
      graduacao: "",
      coordenador: "",
      status: "Pendente",
      dataInicio: "",
      horaInicio: "",
      dataTermino: "",
      horaTermino: "",
      laos: "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function save() {
    // UI-only: validação mínima
    if (!form.graduacao || !form.coordenador || !form.dataInicio || !form.horaInicio) {
      alert("Preencha pelo menos: Graduação, Coordenador, Data início e Hora início.");
      return;
    }
    const next: CamarinhaItem = { ...form, id: uid() };
    setItems((prev) => [next, ...prev]);
    setOpen(false);
  }

  return (
    <div className="cam">
      <div className="cam__head">
        <div>
          <h1 className="appTitle">Camarinha</h1>
        </div>

        <div className="cam__actions">
          <div className="cam__monthPill">
            <button
              className="cam__pillBtn"
              type="button"
              onClick={() => {
                // volta 1 mês
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

            <div className="cam__pillCenter">
              {formatMesAno(mesAno)}
              <input
                className="cam__monthInput"
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                aria-label="Selecionar mês"
              />
            </div>

            <button
              className="cam__pillBtn"
              type="button"
              onClick={() => {
                // avança 1 mês
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

          <button className="cam__filterBtn" type="button">
            Filtrar
          </button>
        </div>
      </div>

      <div className="cam__toolbar">
        <button className="cam__primary" type="button" onClick={openModal}>
          + Cadastrar camarinha
        </button>
      </div>

      <div className="cam__card">
        <div className="cam__table">
          <div className="cam__thead">
            <div>Graduação</div>
            <div>Coordenador</div>
            <div>Status</div>
            <div>Início</div>
            <div>Término</div>
          </div>

          {filtered.length === 0 ? (
            <div className="cam__empty">
              <div className="cam__emptyTitle">Nenhum registro encontrado</div>
              <div className="muted">Clique em “+ Cadastrar camarinha” para criar o primeiro.</div>
            </div>
          ) : (
            <div className="cam__tbody">
              {filtered.map((it) => (
                <div key={it.id} className="cam__tr">
                  <div className="cam__strong">{it.graduacao}</div>
                  <div>{it.coordenador}</div>
                  <div>
                    <span className={`cam__badge cam__badge--${badgeKey(it.status)}`}>
                      {it.status}
                    </span>
                  </div>
                  <div>
                    {formatDate(it.dataInicio)} {it.horaInicio ? `• ${it.horaInicio}` : ""}
                  </div>
                  <div>
                    {it.dataTermino ? formatDate(it.dataTermino) : "—"}{" "}
                    {it.horaTermino ? `• ${it.horaTermino}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div className="cam__overlay" role="dialog" aria-modal="true" aria-label="Cadastrar camarinha">
          <div className="cam__modal">
            <div className="cam__modalHead">
              <div className="cam__modalTitle">Cadastrar camarinha</div>
              <button className="cam__x" type="button" onClick={closeModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="cam__modalBody">
              <div className="cam__grid3">
                <div className="cam__field">
                  <label>Graduação</label>
                  <select
                    value={form.graduacao}
                    onChange={(e) => setForm((p) => ({ ...p, graduacao: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    <option value="Cambone">Cambone</option>
                    <option value="Médium">Médium</option>
                    <option value="Dirigente">Dirigente</option>
                  </select>
                </div>

                <div className="cam__field">
                  <label>Coordenador</label>
                  <input
                    value={form.coordenador}
                    onChange={(e) => setForm((p) => ({ ...p, coordenador: e.target.value }))}
                    placeholder="Coordenador"
                  />
                </div>

                <div className="cam__field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as CamarinhaItem["status"] }))
                    }
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Ativa">Ativa</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="cam__grid2">
                <div className="cam__field">
                  <label>Data início</label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm((p) => ({ ...p, dataInicio: e.target.value }))}
                  />
                </div>

                <div className="cam__field">
                  <label>Hora início</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))}
                  />
                </div>

                <div className="cam__field">
                  <label>Data término</label>
                  <input
                    type="date"
                    value={form.dataTermino}
                    onChange={(e) => setForm((p) => ({ ...p, dataTermino: e.target.value }))}
                  />
                </div>

                <div className="cam__field">
                  <label>Hora término</label>
                  <input
                    type="time"
                    value={form.horaTermino}
                    onChange={(e) => setForm((p) => ({ ...p, horaTermino: e.target.value }))}
                  />
                </div>
              </div>

              <button
                className="cam__linkBtn"
                type="button"
                onClick={() => setForm((p) => ({ ...p, laos: p.laos ? "" : "Selecionado" }))}
              >
                + Selecionar Iaôs
              </button>

              {!!form.laos && <div className="cam__hint muted">Iaôs selecionados: {form.laos}</div>}
            </div>

            <div className="cam__modalFoot">
              <button className="cam__ghost" type="button" onClick={closeModal}>
                Cancelar
              </button>
              <button className="cam__save" type="button" onClick={save}>
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
  // v: yyyy-mm
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

function badgeKey(status: CamarinhaItem["status"]) {
  switch (status) {
    case "Ativa":
      return "ok";
    case "Concluída":
      return "done";
    case "Cancelada":
      return "bad";
    default:
      return "wait";
  }
}
