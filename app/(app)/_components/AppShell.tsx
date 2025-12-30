"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Item = { label: string; href: string; icon: string; group?: string };

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },

  { label: "Membros", href: "/members", icon: "👥", group: "Rotina" },
  { label: "Médiuns", href: "/members/mediuns", icon: "🧑‍🦳", group: "Rotina" },
  { label: "Consulentes", href: "/members/consulentes", icon: "🪪", group: "Rotina" },
  { label: "Convites", href: "/members/invites", icon: "🔗", group: "Rotina" },


  { label: "Giras", href: "/giras", icon: "🕯️", group: "Rotina" },
  { label: "Camarinha", href: "/camarinha", icon: "🎽", group: "Rotina" },
  { label: "Eventos", href: "/events", icon: "📅", group: "Rotina" },
  { label: "Arrecadação", href: "/arrecadacao", icon: "🧺", group: "Rotina" },
  { label: "Pontos", href: "/pontos", icon: "🎵", group: "Rotina" },
  { label: "Agenda", href: "/agenda", icon: "🗓️", group: "Rotina" },
  { label: "Comunicados", href: "/comunicados", icon: "📣", group: "Rotina" },
  { label: "Pedido de reza", href: "/pedidos", icon: "🙏", group: "Rotina" },

  { label: "Financeiro", href: "/financeiro", icon: "📊", group: "Gestão" },
  { label: "Estoque", href: "/estoque", icon: "📦", group: "Gestão" },

  { label: "Configurações", href: "/settings", icon: "⚙️", group: "Sistema" },
];

function groupItems(list: Item[]) {
  const groups: Record<string, Item[]> = {};
  list.forEach((it) => {
    const g = it.group || "—";
    groups[g] = groups[g] || [];
    groups[g].push(it);
  });
  return groups;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // fecha menu ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC fecha
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(() => groupItems(items), []);

  // Dropdown de Membros
  const isMembersRoute = pathname?.startsWith("/members") ?? false;
  const [membersOpen, setMembersOpen] = useState(true);

  useEffect(() => {
    if (isMembersRoute) setMembersOpen(true);
  }, [isMembersRoute]);

  const membersChildren = useMemo(() => {
    return (grouped["Rotina"] || []).filter(
      (x) => x.href.startsWith("/members/") && x.href !== "/members"
    );
  }, [grouped]);

  return (
    <div className="appShell">
      {/* overlay mobile */}
      <button
        className={`appShell__overlay ${open ? "is-open" : ""}`}
        aria-label="Fechar menu"
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">Z</div>
          <div className="sidebar__brandText">
            <strong>Zellador</strong>
            <span>Gestão simples do terreiro</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {/* Dashboard (sem grupo visual) */}
          <div className="sidebar__section">
            {grouped["—"]?.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`sidebar__item ${isActive(pathname, it.href) ? "is-active" : ""}`}
              >
                <span className="sidebar__icon">{it.icon}</span>
                <span className="sidebar__label">{it.label}</span>
              </Link>
            ))}
          </div>

          {/* Grupos */}
          {["Rotina", "Gestão", "Sistema"].map((g) =>
            grouped[g]?.length ? (
              <div className="sidebar__section" key={g}>
                <div className="sidebar__title">{g}</div>

                {grouped[g].map((it) => {
                  const isMembersParent = g === "Rotina" && it.href === "/members";
                  const isMembersChild =
                    g === "Rotina" && it.href.startsWith("/members/") && it.href !== "/members";

                  // não renderiza os filhos aqui (eles aparecem dentro do dropdown)
                  if (isMembersChild) return null;

                  // dropdown do Membros
                  if (isMembersParent) {
                    return (
                      <div key={it.href}>
                        <button
                          type="button"
                          className={`sidebar__item ${isMembersRoute ? "is-active" : ""}`}
                          onClick={() => setMembersOpen((v) => !v)}
                          style={{ width: "100%", textAlign: "left" }}
                        >
                          <span className="sidebar__icon">{it.icon}</span>
                          <span className="sidebar__label">
                            {it.label}{" "}
                            <span className="sidebar__chev">{membersOpen ? "▾" : "▸"}</span>
                          </span>
                        </button>

                        {membersOpen && (
                          <div className="sidebar__submenu">
                            {membersChildren.map((c) => (
                              <Link
                                key={c.href}
                                href={c.href}
                                className={`sidebar__item is-child ${
                                  isActive(pathname, c.href) ? "is-active" : ""
                                }`}
                              >
                                <span className="sidebar__icon">{c.icon}</span>
                                <span className="sidebar__label">{c.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // itens normais
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`sidebar__item ${isActive(pathname, it.href) ? "is-active" : ""}`}
                    >
                      <span className="sidebar__icon">{it.icon}</span>
                      <span className="sidebar__label">{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null
          )}
        </nav>
      </aside>

      <div className="appMain">
        <header className="appTop">
          <button
            className="appTop__burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className="appTop__right">
            <span className="appTop__pill">MVP</span>
          </div>
        </header>

        <div className="appContent">{children}</div>
      </div>
    </div>
  );
}
