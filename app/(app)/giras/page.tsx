'use client';

import React, { useMemo, useState } from 'react';

type GiraTipo =
  | 'Cura'
  | 'Desenvolvimento'
  | 'Atendimento'
  | 'Exu'
  | 'PretoVelho'
  | 'Caboclo'
  | 'Criancas'
  | 'Oxala'
  | 'Especial';

type GiraStatus = 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada';

type Gira = {
  id: string;
  dataISO: string; // YYYY-MM-DD
  inicio: string; // HH:mm
  fim: string; // HH:mm
  tipo: GiraTipo;
  status: GiraStatus;
  titulo: string;
  observacoes?: string | null;
};

const TIPOS: { value: GiraTipo; label: string; badge: string }[] = [
  { value: 'Atendimento', label: 'Atendimento', badge: 'tipo-atendimento' },
  { value: 'Desenvolvimento', label: 'Desenvolvimento', badge: 'tipo-desenvolvimento' },
  { value: 'Cura', label: 'Cura', badge: 'tipo-cura' },
  { value: 'Exu', label: 'Exu', badge: 'tipo-exu' },
  { value: 'Caboclo', label: 'Caboclo', badge: 'tipo-caboclo' },
  { value: 'PretoVelho', label: 'Preto-Velho', badge: 'tipo-preto-velho' },
  { value: 'Criancas', label: 'Crianças', badge: 'tipo-criancas' },
  { value: 'Oxala', label: 'Oxalá', badge: 'tipo-oxala' },
  { value: 'Especial', label: 'Especial', badge: 'tipo-especial' },
];

const STATUS: { value: GiraStatus; label: string; pill: string }[] = [
  { value: 'Agendada', label: 'Agendada', pill: 'pill-agendada' },
  { value: 'Confirmada', label: 'Confirmada', pill: 'pill-confirmada' },
  { value: 'Realizada', label: 'Realizada', pill: 'pill-realizada' },
  { value: 'Cancelada', label: 'Cancelada', pill: 'pill-cancelada' },
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatBR(dateISO: string) {
  const [y, m, d] = dateISO.split('-').map(Number);
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

function getMonthKey(dateISO: string) {
  return dateISO.slice(0, 7); // YYYY-MM
}

function monthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number);
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return `${names[m - 1]} ${y}`;
}

/**
 * MVP: ainda usando mock local.
 * Quando você ligar a API do Supabase:
 * - troque MOCK_GIRAS por state + fetch('/api/giras?casa_id=...')
 * - e no modal troque o "alert" pelos POST/PATCH
 */
const MOCK_GIRAS: Gira[] = [
  {
    id: 'g1',
    dataISO: '2025-12-28',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'Atendimento',
    status: 'Realizada',
    titulo: 'Gira de Atendimento',
    observacoes: 'Acolhimento e consultas.',
  },
  {
    id: 'g2',
    dataISO: '2026-01-04',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'Desenvolvimento',
    status: 'Confirmada',
    titulo: 'Desenvolvimento Mediúnico',
    observacoes: 'Parte prática + alinhamentos.',
  },
  {
    id: 'g3',
    dataISO: '2026-01-11',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'Exu',
    status: 'Agendada',
    titulo: 'Gira de Exu',
    observacoes: 'Firmeza e organização.',
  },
  {
    id: 'g4',
    dataISO: '2026-01-18',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'PretoVelho',
    status: 'Agendada',
    titulo: 'Gira de Preto-Velho',
    observacoes: null,
  },
  {
    id: 'g5',
    dataISO: '2026-01-25',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'Caboclo',
    status: 'Agendada',
    titulo: 'Gira de Caboclo',
    observacoes: null,
  },
];

export default function GirasPage() {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<GiraTipo | 'Todos'>('Todos');
  const [status, setStatus] = useState<GiraStatus | 'Todos'>('Todos');
  const [mes, setMes] = useState<string>('Todos'); // YYYY-MM ou Todos
  const [view, setView] = useState<'cards' | 'lista'>('cards');

  // Modal (cadastro/edição)
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Gira | null>(null);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(g: Gira) {
    setEditing(g);
    setModalOpen(true);
  }

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(MOCK_GIRAS.map((g) => getMonthKey(g.dataISO)));
    return Array.from(set).sort();
  }, []);

  const filtradas = useMemo(() => {
    const query = q.trim().toLowerCase();

    return MOCK_GIRAS
      .slice()
      .sort((a, b) => a.dataISO.localeCompare(b.dataISO))
      .filter((g) => (tipo === 'Todos' ? true : g.tipo === tipo))
      .filter((g) => (status === 'Todos' ? true : g.status === status))
      .filter((g) => (mes === 'Todos' ? true : getMonthKey(g.dataISO) === mes))
      .filter((g) => {
        if (!query) return true;
        const hay = `${g.titulo} ${g.tipo} ${g.status} ${g.observacoes ?? ''} ${g.dataISO}`.toLowerCase();
        return hay.includes(query);
      });
  }, [q, tipo, status, mes]);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <h1>Giras</h1>
          <p className="muted">Visualização consolidada por tipo, com filtros simples (sem sidebar redundante).</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => setView((v) => (v === 'cards' ? 'lista' : 'cards'))}>
            {view === 'cards' ? 'Ver em lista' : 'Ver em cards'}
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            + Nova gira
          </button>
        </div>
      </header>

      <section className="filters">
        <div className="field">
          <label>Buscar</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="título, tipo, status, observação..." />
        </div>

        <div className="field">
          <label>Mês</label>
          <select value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="Todos">Todos</option>
            {mesesDisponiveis.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="Todos">Todos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="Todos">Todos</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="summary">
          <div className="summary-card">
            <div className="summary-kpi">{filtradas.length}</div>
            <div className="summary-label">giras encontradas</div>
          </div>
        </div>
      </section>

      {view === 'cards' ? (
        <section className="grid">
          {filtradas.map((g) => {
            const tipoMeta = TIPOS.find((t) => t.value === g.tipo);
            const statusMeta = STATUS.find((s) => s.value === g.status);

            return (
              <article key={g.id} className={`card ${tipoMeta?.badge ?? ''}`}>
                <div className="card-top">
                  <div className="card-date">
                    <div className="date-big">{formatBR(g.dataISO)}</div>
                    <div className="date-small">
                      {g.inicio} – {g.fim}
                    </div>
                  </div>
                  <div className={`pill ${statusMeta?.pill ?? ''}`}>{g.status}</div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{g.titulo}</h3>
                  <div className="badges">
                    <span className="badge">{TIPOS.find((t) => t.value === g.tipo)?.label ?? g.tipo}</span>
                    <span className="badge badge-soft">Sábado</span>
                  </div>

                  {g.observacoes ? <p className="card-note">{g.observacoes}</p> : <p className="card-note muted">Sem observações.</p>}
                </div>

                <div className="card-footer">
                  <button className="btn btn-ghost" onClick={() => alert(`Abrir detalhes: ${g.id}`)}>
                    Detalhes
                  </button>
                  <button className="btn btn-ghost" onClick={() => openEdit(g)}>
                    Editar
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Status</th>
                <th className="right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((g) => {
                const statusMeta = STATUS.find((s) => s.value === g.status);
                return (
                  <tr key={g.id}>
                    <td>{formatBR(g.dataISO)}</td>
                    <td>
                      {g.inicio} – {g.fim}
                    </td>
                    <td className="strong">{g.titulo}</td>
                    <td>
                      <span className="badge">{TIPOS.find((t) => t.value === g.tipo)?.label ?? g.tipo}</span>
                    </td>
                    <td>
                      <span className={`pill ${statusMeta?.pill ?? ''}`}>{g.status}</span>
                    </td>
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => alert(`Detalhes: ${g.id}`)}>
                        Detalhes
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ padding: 18 }}>
                    Nenhuma gira encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      <GiraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSaved={async () => {
          // aqui você vai chamar loadGiras() quando ligar a API
          alert('MVP: depois liga o POST/PATCH aqui');
        }}
      />
    </div>
  );
}

function GiraModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Gira> | null;
  onSaved: () => Promise<void> | void;
}) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<Partial<Gira>>({
    dataISO: initial?.dataISO ?? '',
    inicio: initial?.inicio ?? '18:30',
    fim: initial?.fim ?? '23:00',
    tipo: (initial?.tipo ?? 'Atendimento') as GiraTipo,
    status: (initial?.status ?? 'Agendada') as GiraStatus,
    titulo: initial?.titulo ?? '',
    observacoes: initial?.observacoes ?? '',
    id: initial?.id,
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setErr(null);
    setSaving(false);
    setForm({
      dataISO: initial?.dataISO ?? '',
      inicio: initial?.inicio ?? '18:30',
      fim: initial?.fim ?? '23:00',
      tipo: (initial?.tipo ?? 'Atendimento') as GiraTipo,
      status: (initial?.status ?? 'Agendada') as GiraStatus,
      titulo: initial?.titulo ?? '',
      observacoes: initial?.observacoes ?? '',
      id: initial?.id,
    });
  }, [open, initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.dataISO) return setErr('Informe a data.');
    if (!form.titulo?.trim()) return setErr('Informe o título.');
    if (!form.inicio) return setErr('Informe o horário de início.');
    if (!form.fim) return setErr('Informe o horário de término.');

    setSaving(true);
    try {
      // MVP: aqui você liga no seu /api/giras (POST/PATCH)
      // - Novo: POST /api/giras
      // - Editar: PATCH /api/giras/:id
      // Por enquanto só simula
      await new Promise((r) => setTimeout(r, 400));

      await onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? 'Editar gira' : 'Nova gira'}</div>
            <div className="modal-sub muted">Cadastre o tipo aqui e a tela consolida tudo por filtro.</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>Data</label>
              <input
                type="date"
                value={form.dataISO ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, dataISO: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Início</label>
              <input
                type="time"
                value={form.inicio ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, inicio: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Fim</label>
              <input
                type="time"
                value={form.fim ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, fim: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Tipo</label>
              <select value={(form.tipo ?? 'Atendimento') as any} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as any }))}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={(form.status ?? 'Agendada') as any}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
              >
                {STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Título</label>
              <input
                value={form.titulo ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                placeholder="Ex.: Gira de Atendimento"
              />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Observações</label>
              <input
                value={(form.observacoes as any) ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
                placeholder="Opcional..."
              />
            </div>
          </div>

          {err && <div className="form-error">{err}</div>}

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button disabled={saving} className="btn btn-primary" type="submit">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar gira'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
