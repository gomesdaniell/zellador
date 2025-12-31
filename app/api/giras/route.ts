'use client';

import React, { useEffect, useMemo, useState } from 'react';

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
  casa_id: string;
  data: string; // YYYY-MM-DD
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
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${names[m - 1]} ${y}`;
}

export default function GirasPage() {
  const [casaId, setCasaId] = useState<string | null>(null);

  const [giras, setGiras] = useState<Gira[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    // MVP: casa ativa no localStorage
    const id = typeof window !== 'undefined' ? localStorage.getItem('casa_id') : null;
    setCasaId(id);
  }, []);

  async function loadGiras(forCasaId?: string | null) {
    const id = forCasaId ?? casaId;

    if (!id) {
      setLoading(false);
      setError('casa_id não definido. Defina no localStorage: localStorage.setItem("casa_id","UUID_DA_CASA")');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/giras?casa_id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error ?? 'Falha ao carregar giras');
      }

      setGiras(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro desconhecido');
      setGiras([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (casaId) loadGiras(casaId);
  }, [casaId]);

  async function removeGira(id: string) {
    if (!confirm('Excluir esta gira?')) return;

    try {
      const res = await fetch(`/api/giras/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? 'Falha ao excluir');
      await loadGiras();
    } catch (e: any) {
      alert(e?.message ?? 'Erro ao excluir');
    }
  }

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(giras.map((g) => getMonthKey(g.data)));
    return Array.from(set).sort();
  }, [giras]);

  const filtradas = useMemo(() => {
    const query = q.trim().toLowerCase();

    return giras
      .slice()
      .sort((a, b) => (a.data + a.inicio).localeCompare(b.data + b.inicio))
      .filter((g) => (tipo === 'Todos' ? true : g.tipo === tipo))
      .filter((g) => (status === 'Todos' ? true : g.status === status))
      .filter((g) => (mes === 'Todos' ? true : getMonthKey(g.data) === mes))
      .filter((g) => {
        if (!query) return true;
        const hay = `${g.titulo} ${g.tipo} ${g.status} ${g.observacoes ?? ''} ${g.data}`.toLowerCase();
        return hay.includes(query);
      });
  }, [giras, q, tipo, status, mes]);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <h1>Giras</h1>
          <p className="muted">Visualização consolidada por tipo, com filtros simples.</p>
          {casaId && <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>Casa ativa: {casaId}</p>}
        </div>

        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => setView((v) => (v === 'cards' ? 'lista' : 'cards'))}>
            {view === 'cards' ? 'Ver em lista' : 'Ver em cards'}
          </button>
          <button className="btn btn-primary" onClick={openNew} disabled={!casaId}>
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

      {error && (
        <div className="form-error" style={{ margin: '10px 0' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="muted" style={{ padding: 18 }}>
          Carregando giras...
        </div>
      ) : view === 'cards' ? (
        <section className="grid">
          {filtradas.map((g) => {
            const tipoMeta = TIPOS.find((t) => t.value === g.tipo);
            const statusMeta = STATUS.find((s) => s.value === g.status);

            return (
              <article key={g.id} className={`card ${tipoMeta?.badge ?? ''}`}>
                <div className="card-top">
                  <div className="card-date">
                    <div className="date-big">{formatBR(g.data)}</div>
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
                  <button className="btn btn-ghost" onClick={() => openEdit(g)}>
                    Editar
                  </button>
                  <button className="btn btn-ghost" onClick={() => removeGira(g.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            );
          })}

          {filtradas.length === 0 && (
            <div className="muted" style={{ padding: 18 }}>
              Nenhuma gira encontrada com esses filtros.
            </div>
          )}
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
                    <td>{formatBR(g.data)}</td>
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
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>
                        Editar
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeGira(g.id)}>
                        Excluir
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
        casaId={casaId}
        onSaved={async () => {
          await loadGiras();
        }}
      />
    </div>
  );
}

function GiraModal({
  open,
  onClose,
  initial,
  casaId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Gira> | null;
  casaId: string | null;
  onSaved: () => Promise<void> | void;
}) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<Partial<Gira>>({
    data: initial?.data ?? '',
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

  useEffect(() => {
    if (!open) return;
    setErr(null);
    setSaving(false);
    setForm({
      data: initial?.data ?? '',
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

    if (!casaId) return setErr('casa_id não definido (localStorage).');
    if (!form.data) return setErr('Informe a data.');
    if (!form.titulo?.trim()) return setErr('Informe o título.');
    if (!form.inicio) return setErr('Informe o horário de início.');
    if (!form.fim) return setErr('Informe o horário de término.');

    setSaving(true);
    try {
      const payload = {
        casa_id: casaId,
        data: form.data,
        inicio: form.inicio,
        fim: form.fim,
        tipo: form.tipo,
        status: form.status,
        titulo: form.titulo,
        observacoes: form.observacoes || null,
      };

      const url = isEdit ? `/api/giras/${form.id}` : `/api/giras`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error ?? 'Falha ao salvar');
      }

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
                value={form.data ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
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
              <select value={(form.status ?? 'Agendada') as any} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}>
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
