"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { label: string; href: string; icon: string; group?: string };

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },

  { label: "Membros", href: "/members", icon: "👥", group: "Rotina" },
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

  const grouped = groupItems(items);

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
                className={`sidebar__item ${pathname === it.href ? "is-active" : ""}`}
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
                {grouped[g].map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`sidebar__item ${pathname === it.href ? "is-active" : ""}`}
                  >
                    <span className="sidebar__icon">{it.icon}</span>
                    <span className="sidebar__label">{it.label}</span>
                  </Link>
                ))}
              </div>
            ) : null
          )}
        </nav>
      </aside>

      <div className="appMain">
        <header className="appTop">
          <button className="appTop__burger" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
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
