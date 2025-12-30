"use client";

import { useMemo, useState } from "react";

type ConteudoTipo = "ARQUIVO" | "LINK";
type PontoTipo = "Subida" | "Descida" | "Saudação" | "Chamada" | "Encerramento" | "Outro";

type PontoItem = {
  id: string;
  titulo: string;
  tipo: PontoTipo;
  linha: string;
  orixa: string;

  conteudoTipo: ConteudoTipo;
  url?: string; // para LINK
  fileName?: string; // para ARQUIVO
  fileMime?: string; // para ARQUIVO
  fileUrl?: string; // objectURL (MVP)
  tags?: string;
  criadoEm: string; // ISO
};

const uid = () => Math.random().toString(36).slice(2, 10);

const TIPOS: PontoTipo[] = ["Subida", "Descida", "Saudação", "Chamada", "Encerramento", "Outro"];
const ORIXAS = ["Oxalá", "Ogum", "Oxóssi", "Xangô", "Oxum", "Iansã", "Iemanjá", "Obaluayê", "Nanã", "Exu", "Pombagira"];
const LINHAS = ["Caboclos", "Pretos-Velhos", "Crianças", "Exus", "Baianos", "Boiadeiros", "Marinheiros", "Ciganos", "Outro"];

function nowIso() {
  return new Date().toISOString();
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

function guessContentKind(item: PontoItem) {
  if (item.conteudoTipo === "LINK") {
    const u = (item.url || "").toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE";
    if (u.includes("spotify.com")) return "SPOTIFY";
    return "LINK";
  }
  // arquivo
  const m = (item.fileMime || "").toLowerCase();
  if (m.startsWith("audio/")) return "AUDIO";
  if (m.startsWith("video/")) return "VIDEO";
  if (m.includes("pdf")) return "PDF";
  if (m.startsWith("image/")) return "IMAGE";
  return "FILE";
}

function iconFor(item: PontoItem) {
  const k = guessContentKind(item);
  if (k === "AUDIO") return "🎵";
  if (k === "VIDEO") return "🎬";
  if (k === "PDF") return "📄";
  if (k === "IMAGE") return "🖼️";
  if (k === "YOUTUBE") return "▶️";
  if (k === "SPOTIFY") return "🟢";
  return "🔗";
}

function buildYouTubeEmbed(url: string) {
  // suporta youtu.be/<id> e youtube.com/watch?v=<id>
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {}
  return "";
}

function buildSpotifyEmbed(url: string) {
  // transforma https://open.spotify.com/track/... em embed
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return "";
    // pega /track/<id> | /playlist/<id> | /album/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return "";
    const kind = parts[0];
    const id = parts[1];
    return `https://open.spotify.com/embed/${kind}/${id}`;
  } catch {}
  return "";
}

export default function PontosPage() {
  // mock (você pode deixar vazio)
  const [items, setItems] = useState<PontoItem[]>([]);

  const [q, setQ] = useState("");
  const [fTipo, setFTipo] = useState<PontoTipo | "Todos">("Todos");
  const [fLinha, setFLinha] = useState<string | "Todos">("Todos");
  const [fOrixa, setFOrixa] = useState<string | "Todos">("Todos");
  const [fConteudo, setFConteudo] = useState<ConteudoTipo | "Todos">("Todos");

  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState<PontoItem | null>(null);

  // form
  const [conteudoTipo, setConteudoTipo] = useState<ConteudoTipo>("ARQUIVO");
  const [form, setForm] = useState({
    titulo: "",
    tipo: "Subida" as PontoTipo,
    linha: "",
    orixa: "",
    url: "",
    tags: "",
    file: null as File | null,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (fTipo !== "Todos" && it.tipo !== fTipo) return false;
      if (fLinha !== "Todos" && it.linha !== fLinha) return false;
      if (fOrixa !== "Todos" && it.orixa !== fOrixa) return false;
      if (fConteudo !== "Todos" && it.conteudoTipo !== fConteudo) return false;

      if (!term) return true;
      const hay = `${it.titulo} ${it.tipo} ${it.linha} ${it.orixa} ${it.tags || ""} ${it.fileName || ""} ${it.url || ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [items, q, fTipo, fLinha, fOrixa, fConteudo]);

  function resetAdd() {
    setConteudoTipo("ARQUIVO");
    setForm({
      titulo: "",
      tipo: "Subida",
      linha: "",
      orixa: "",
      url: "",
      tags: "",
      file: null,
    });
  }

  function openAddModal() {
    resetAdd();
    setOpenAdd(true);
  }

  function saveAdd() {
    const titulo = form.titulo.trim();
    const linha = form.linha.trim();
    const orixa = form.orixa.trim();

    if (!titulo || !linha || !orixa) {
      alert("Preencha: Nome do ponto, Linha e Orixá.");
      return;
    }

    if (conteudoTipo === "LINK") {
      const url = form.url.trim();
      if (!url) {
        alert("Cole um link (YouTube/Spotify/URL).");
        return;
      }
      // valida URL básica
      try {
        new URL(url);
      } catch {
        alert("Link inválido. Cole uma URL completa (https://...).");
        return;
      }

      const next: PontoItem = {
        id: uid(),
        titulo,
        tipo: form.tipo,
        linha,
        orixa,
        conteudoTipo: "LINK",
        url,
        tags: form.tags.trim() || undefined,
        criadoEm: nowIso(),
      };
      setItems((p) => [next, ...p]);
      setOpenAdd(false);
      return;
    }

    // ARQUIVO
    if (!form.file) {
      alert("Envie um arquivo (PDF/DOC/MP3/MP4/Imagem).");
      return;
    }

    const fileUrl = URL.createObjectURL(form.file);
    const next: PontoItem = {
      id: uid(),
      titulo,
      tipo: form.tipo,
      linha,
      orixa,
      conteudoTipo: "ARQUIVO",
      fileName: form.file.name,
      fileMime: form.file.type || "application/octet-stream",
      fileUrl,
      tags: form.tags.trim() || undefined,
      criadoEm: nowIso(),
    };

    setItems((p) => [next, ...p]);
    setOpenAdd(false);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found?.conteudoTipo === "ARQUIVO" && found.fileUrl) {
        try { URL.revokeObjectURL(found.fileUrl); } catch {}
      }
      return prev.filter((x) => x.id !== id);
    });
  }

  function openViewer(item: PontoItem) {
    setOpenView(item);
  }

  function closeViewer() {
    setOpenView(null);
  }

  function openExternal(item: PontoItem) {
    if (item.conteudoTipo === "LINK" && item.url) window.open(item.url, "_blank", "noopener,noreferrer");
    if (item.conteudoTipo === "ARQUIVO" && item.fileUrl) window.open(item.fileUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="pts">
      <div className="pts__head">
        <div>
          <h1 className="appTitle">Pontos</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Biblioteca organizada de pontos (arquivo ou link) com filtros rápidos.
          </p>
        </div>

        <button className="pts__primary" type="button" onClick={openAddModal}>
          + Adicionar ponto
        </button>
      </div>

      <div className="pts__controls">
        <div className="pts__search">
          <span className="pts__searchIcon">🔎</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, linha, orixá, tags..."
          />
        </div>

        <div className="pts__filters">
          <Select label="Tipo" value={fTipo} onChange={setFTipo} options={["Todos", ...TIPOS]} />
          <Select label="Linha" value={fLinha} onChange={setFLinha} options={["Todos", ...LINHAS]} />
          <Select label="Orixá" value={fOrixa} onChange={setFOrixa} options={["Todos", ...ORIXAS]} />
          <Select label="Conteúdo" value={fConteudo} onChange={setFConteudo} options={["Todos", "ARQUIVO", "LINK"]} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="pts__empty">
          <div className="pts__emptyTitle">Nenhum ponto encontrado</div>
          <div className="muted">Clique em “+ Adicionar ponto” para cadastrar arquivo ou colar link.</div>
        </div>
      ) : (
        <div className="pts__grid">
          {filtered.map((it) => (
            <div key={it.id} className="pts__card">
              <div className="pts__cardTop">
                <div className="pts__icon">{iconFor(it)}</div>
                <div className="pts__meta">
                  <div className="pts__title" title={it.titulo}>{it.titulo}</div>
                  <div className="pts__sub muted">
                    {prettyDate(it.criadoEm)} • {it.conteudoTipo === "ARQUIVO" ? (it.fileName || "Arquivo") : "Link"}
                  </div>
                </div>
              </div>

              <div className="pts__chips">
                <span className="pts__chip">{it.tipo}</span>
                <span className="pts__chip">{it.linha}</span>
                <span className="pts__chip">{it.orixa}</span>
                {it.conteudoTipo === "LINK" ? <span className="pts__chip pts__chip--link">Link</span> : <span className="pts__chip pts__chip--file">Arquivo</span>}
              </div>

              {it.tags ? <div className="pts__tags muted">Tags: {it.tags}</div> : <div className="pts__tags muted"> </div>}

              <div className="pts__actions">
                <button className="pts__btn pts__btn--primary" type="button" onClick={() => openViewer(it)}>
                  Abrir
                </button>
                <button className="pts__btn" type="button" onClick={() => openExternal(it)}>
                  {it.conteudoTipo === "LINK" ? "Ir para link" : "Abrir/baixar"}
                </button>
                <button className="pts__btn pts__btn--danger" type="button" onClick={() => removeItem(it.id)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL ADICIONAR */}
      {openAdd && (
        <div className="pts__overlay" role="dialog" aria-modal="true" aria-label="Adicionar ponto">
          <div className="pts__modal">
            <div className="pts__modalHead">
              <div className="pts__modalTitle">Adicionar ponto</div>
              <button className="pts__x" type="button" onClick={() => setOpenAdd(false)} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="pts__modalBody">
              <div className="pts__switch">
                <button
                  type="button"
                  className={["pts__switchBtn", conteudoTipo === "ARQUIVO" ? "isOn" : ""].join(" ")}
                  onClick={() => setConteudoTipo("ARQUIVO")}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  className={["pts__switchBtn", conteudoTipo === "LINK" ? "isOn" : ""].join(" ")}
                  onClick={() => setConteudoTipo("LINK")}
                >
                  Link (YouTube/Spotify)
                </button>
              </div>

              <div className="pts__formGrid">
                <Field label="Nome do ponto">
                  <input value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} />
                </Field>

                <Field label="Tipo do ponto">
                  <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as PontoTipo }))}>
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Linha">
                  <select value={form.linha} onChange={(e) => setForm((p) => ({ ...p, linha: e.target.value }))}>
                    <option value="">Selecione</option>
                    {LINHAS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Orixá">
                  <select value={form.orixa} onChange={(e) => setForm((p) => ({ ...p, orixa: e.target.value }))}>
                    <option value="">Selecione</option>
                    {ORIXAS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                {conteudoTipo === "LINK" ? (
                  <Field label="Link (cole aqui)">
                    <input
                      value={form.url}
                      onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                      placeholder="https://youtube.com/... ou https://open.spotify.com/..."
                    />
                  </Field>
                ) : (
                  <Field label="Arquivo (PDF/DOC/MP3/MP4/Imagem)">
                    <input
                      type="file"
                      onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                    />
                  </Field>
                )}

                <Field label="Tags (opcional)">
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="Ex.: proteção, cura, firmeza"
                  />
                </Field>
              </div>

              <div className="pts__hint muted">
                Dica: cadastre rápido. O valor aqui é achar e abrir em 2 cliques.
              </div>
            </div>

            <div className="pts__modalFoot">
              <button className="pts__ghost" type="button" onClick={() => setOpenAdd(false)}>
                Cancelar
              </button>
              <button className="pts__save" type="button" onClick={saveAdd}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWER */}
      {openView && (
        <div className="pts__overlay" role="dialog" aria-modal="true" aria-label="Visualizar ponto">
          <div className="pts__viewer">
            <div className="pts__modalHead">
              <div className="pts__modalTitle">{openView.titulo}</div>
              <button className="pts__x" type="button" onClick={closeViewer} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="pts__viewerBody">
              <div className="pts__viewerMeta">
                <span className="pts__chip">{openView.tipo}</span>
                <span className="pts__chip">{openView.linha}</span>
                <span className="pts__chip">{openView.orixa}</span>
                {openView.conteudoTipo === "LINK" ? <span className="pts__chip pts__chip--link">Link</span> : <span className="pts__chip pts__chip--file">Arquivo</span>}
              </div>

              <ViewerContent item={openView} />
            </div>

            <div className="pts__modalFoot">
              <button className="pts__ghost" type="button" onClick={closeViewer}>
                Fechar
              </button>
              <button className="pts__save" type="button" onClick={() => openExternal(openView)}>
                {openView.conteudoTipo === "LINK" ? "Abrir link" : "Abrir/baixar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ViewerContent({ item }: { item: PontoItem }) {
  const kind = guessContentKind(item);

  if (item.conteudoTipo === "LINK" && item.url) {
    const yt = kind === "YOUTUBE" ? buildYouTubeEmbed(item.url) : "";
    const sp = kind === "SPOTIFY" ? buildSpotifyEmbed(item.url) : "";

    if (yt) {
      return (
        <div className="pts__embed">
          <iframe
            src={yt}
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (sp) {
      return (
        <div className="pts__embed pts__embed--spotify">
          <iframe
            src={sp}
            title="Spotify"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <div className="pts__viewerNote">
        <div className="muted">Link cadastrado:</div>
        <div className="pts__mono">{item.url}</div>
      </div>
    );
  }

  // arquivo
  if (!item.fileUrl) {
    return <div className="pts__viewerNote muted">Arquivo não disponível (MVP / state local).</div>;
  }

  if (kind === "AUDIO") {
    return (
      <div className="pts__player">
        <audio controls src={item.fileUrl} />
        <div className="muted" style={{ marginTop: 8 }}>{item.fileName}</div>
      </div>
    );
  }

  if (kind === "VIDEO") {
    return (
      <div className="pts__player">
        <video controls src={item.fileUrl} />
        <div className="muted" style={{ marginTop: 8 }}>{item.fileName}</div>
      </div>
    );
  }

  if (kind === "IMAGE") {
    return (
      <div className="pts__imgWrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.fileUrl} alt={item.fileName || "Imagem"} />
      </div>
    );
  }

  // PDF e outros: MVP seguro = mostrar instrução (abre em nova aba pelo botão)
  return (
    <div className="pts__viewerNote">
      <div className="muted">
        Preview completo (PDF/DOC) a gente ativa depois. Por enquanto clique em <b>Abrir/baixar</b>.
      </div>
      <div className="pts__mono">{item.fileName}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pts__field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: T[];
}) {
  return (
    <div className="pts__select">
      <span className="pts__selectLabel">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "ARQUIVO" ? "Arquivo" : o === "LINK" ? "Link" : o}
          </option>
        ))}
      </select>
    </div>
  );
}
