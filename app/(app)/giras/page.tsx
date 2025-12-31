'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    console.log(data.session);
  });
}, []);



type GiraTipo =
  | 'Cura'
  | 'Desenvolvimento'
  | 'Atendimento'
  | 'Exu'
  | 'Preto-Velho'
  | 'Caboclo'
  | 'Crianças'
  | 'Oxalá'
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
  observacoes?: string;
};

const TIPOS: { value: GiraTipo; label: string; badge: string }[] = [
  { value: 'Atendimento', label: 'Atendimento', badge: 'tipo-atendimento' },
  { value: 'Desenvolvimento', label: 'Desenvolvimento', badge: 'tipo-desenvolvimento' },
  { value: 'Cura', label: 'Cura', badge: 'tipo-cura' },
  { value: 'Exu', label: 'Exu', badge: 'tipo-exu' },
  { value: 'Caboclo', label: 'Caboclo', badge: 'tipo-caboclo' },
  { value: 'Preto-Velho', label: 'Preto-Velho', badge: 'tipo-preto-velho' },
  { value: 'Crianças', label: 'Crianças', badge: 'tipo-criancas' },
  { value: 'Oxalá', label: 'Oxalá', badge: 'tipo-oxala' },
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
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ];
  return `${names[m - 1]} ${y}`;
}

// MOCK: substitua por fetch/API depois
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
    tipo: 'Preto-Velho',
    status: 'Agendada',
    titulo: 'Gira de Preto-Velho',
  },
  {
    id: 'g5',
    dataISO: '2026-01-25',
    inicio: '18:30',
    fim: '23:00',
    tipo: 'Caboclo',
    status: 'Agendada',
    titulo: 'Gira de Caboclo',
  },
];

export default function GirasPage() {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<GiraTipo | 'Todos'>('Todos');
  const [status, setStatus] = useState<GiraStatus | 'Todos'>('Todos');
  const [mes, setMes] = useState<string>('Todos'); // YYYY-MM ou Todos
  const [view, setView] = useState<'cards' | 'lista'>('cards');

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(MOCK_GIRAS.map(g => getMonthKey(g.dataISO)));
    const arr = Array.from(set).sort();
    return arr;
  }, []);

  const filtradas = useMemo(() => {
    const query = q.trim().toLowerCase();

    return MOCK_GIRAS
      .slice()
      .sort((a, b) => a.dataISO.localeCompare(b.dataISO))
      .filter(g => (tipo === 'Todos' ? true : g.tipo === tipo))
      .filter(g => (status === 'Todos' ? true : g.status === status))
      .filter(g => (mes === 'Todos' ? true : getMonthKey(g.dataISO) === mes))
      .filter(g => {
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
          <p className="muted">
            Visualização consolidada por tipo, com filtros simples (sem sidebar redundante).
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => setView(v => (v === 'cards' ? 'lista' : 'cards'))}>
            {view === 'cards' ? 'Ver em lista' : 'Ver em cards'}
          </button>
          <button className="btn btn-primary" onClick={() => alert('Depois você liga isso no cadastro/CRUD 🙂')}>
            + Nova gira
          </button>
        </div>
      </header>

      <section className="filters">
        <div className="field">
          <label>Buscar</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="título, tipo, status, observação..."
          />
        </div>

        <div className="field">
          <label>Mês</label>
          <select value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="Todos">Todos</option>
            {mesesDisponiveis.map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
            <option value="Todos">Todos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="Todos">Todos</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
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
            const tipoMeta = TIPOS.find(t => t.value === g.tipo);
            const statusMeta = STATUS.find(s => s.value === g.status);

            return (
              <article key={g.id} className={`card ${tipoMeta?.badge ?? ''}`}>
                <div className="card-top">
                  <div className="card-date">
                    <div className="date-big">{formatBR(g.dataISO)}</div>
                    <div className="date-small">{g.inicio} – {g.fim}</div>
                  </div>
                  <div className={`pill ${statusMeta?.pill ?? ''}`}>{g.status}</div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{g.titulo}</h3>
                  <div className="badges">
                    <span className="badge">{g.tipo}</span>
                    <span className="badge badge-soft">Sábado</span>
                  </div>

                  {g.observacoes ? (
                    <p className="card-note">{g.observacoes}</p>
                  ) : (
                    <p className="card-note muted">Sem observações.</p>
                  )}
                </div>

                <div className="card-footer">
                  <button className="btn btn-ghost" onClick={() => alert(`Abrir detalhes: ${g.id}`)}>
                    Detalhes
                  </button>
                  <button className="btn btn-ghost" onClick={() => alert(`Editar: ${g.id}`)}>
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
                const statusMeta = STATUS.find(s => s.value === g.status);
                return (
                  <tr key={g.id}>
                    <td>{formatBR(g.dataISO)}</td>
                    <td>{g.inicio} – {g.fim}</td>
                    <td className="strong">{g.titulo}</td>
                    <td><span className="badge">{g.tipo}</span></td>
                    <td><span className={`pill ${statusMeta?.pill ?? ''}`}>{g.status}</span></td>
                    <td className="right">
                      <button className="btn btn-ghost btn-sm" onClick={() => alert(`Detalhes: ${g.id}`)}>Detalhes</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => alert(`Editar: ${g.id}`)}>Editar</button>
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
    </div>
  );
}
