"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon?: string; // emoji simples (MVP); depois trocamos por lucide
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: "🏠" }],
  },
  {
    title: "Rotina da Casa",
    items: [
      { label: "Membros", href: "/membros", icon: "👥" },
      { label: "Giras", href: "/giras", icon: "🕯️" },
      { label: "Camarinhas", href: "/camarinhas", icon: "🧺" },
      { label: "Eventos", href: "/eventos", icon: "📅" },
      { label: "Arrecadação", href: "/arrecadacao", icon: "🧾" },
      { label: "Pontos", href: "/pontos", icon: "🎵" },
      { label: "Agenda", href: "/agenda", icon: "🗓️" },
      { label: "Comunicados", href: "/comunicados", icon: "📣" },
      { label: "Pedido de reza", href: "/pedidos-de-reza", icon: "🙏" },
    ],
  },
  {
    title: "Gestão",
    items: [
      { label: "Financeiro", href: "/financeiro", icon: "💰" },
      { label: "Estoque", href: "/estoque", icon: "📦" },
    ],
  },
  {
    title: "Sistema",
    items: [{ label: "Configurações", href: "/configuracoes", icon: "⚙️" }],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`z-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside className={`z-sidebar ${isOpen ? "open" : ""}`}>
        <div className="z-side-top">
          <div className="z-logo">
            <div className="z-logo-badge">Z</div>
            <div className="z-logo-text">
              <div className="z-logo-title">Zellador</div>
              <div className="z-logo-sub">Casa • Rotina • Gestão</div>
            </div>
          </div>
        </div>

        <nav className="z-nav">
          {NAV.map((group, gi) => (
            <div key={gi} className="z-group">
              {group.title && <div className="z-group-title">{group.title}</div>}

              <div className="z-group-items">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`z-item ${active ? "active" : ""}`}
                      onClick={onClose}
                    >
                      <span className="z-ico" aria-hidden="true">
                        {item.icon || "•"}
                      </span>
                      <span className="z-label">{item.label}</span>
                      <span className="z-chev" aria-hidden="true">
                        ›
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="z-side-footer">
          <div className="z-hint">MVP • simples e intuitivo</div>
        </div>
      </aside>
    </>
  );
}
