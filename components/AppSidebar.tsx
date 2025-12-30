"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Role = "viewer" | "admin" | "owner" | "finance" | "stock";
type NavItem =
  | { type: "link"; label: string; href: string; restrictedTo?: Role[] }
  | { type: "group"; label: string; key: string; children: NavItem[] };

export default function AppSidebar() {
  const pathname = usePathname();

  // 🔒 Mock de perfil (por enquanto). Depois você liga isso ao login.
  const role: Role = "viewer";

  const nav: NavItem[] = useMemo(
    () => [
      { type: "link", label: "Home", href: "/home" },

      {
        type: "group",
        label: "Membros",
        key: "membros",
        children: [
          { type: "link", label: "Médiuns", href: "/mediuns" },
          { type: "link", label: "Consulentes", href: "/consulentes" },
        ],
      },

      {
        type: "group",
        label: "Giras",
        key: "giras",
        children: [
          { type: "link", label: "Atendimento", href: "/giras/atendimento" },
          { type: "link", label: "Treinamento", href: "/giras/treinamento" },
          { type: "link", label: "Festiva", href: "/giras/festiva" },
          { type: "link", label: "Corrente", href: "/giras/corrente" },
        ],
      },

      { type: "link", label: "Camarinha", href: "/camarinha" },
      { type: "link", label: "Eventos", href: "/eventos" },
      { type: "link", label: "Arrecadação", href: "/arrecadacao" },
      { type: "link", label: "Pontos", href: "/pontos" },
      { type: "link", label: "Agenda", href: "/agenda" },
      { type: "link", label: "Comunicados", href: "/comunicados" },
      { type: "link", label: "Pedido de reza", href: "/pedido-de-reza" },

      // 🔐 Itens preparados para permissões
      { type: "link", label: "Financeiro", href: "/financeiro", restrictedTo: ["finance", "admin", "owner"] },
      { type: "link", label: "Estoque", href: "/estoque", restrictedTo: ["stock", "admin", "owner"] },

  {
    type: "group",
    label: "Configurações",
    key: "config",
    children: [
      { type: "link", label: "Configurações", href: "/configuracoes", restrictedTo: ["admin", "owner"] },
      { type: "link", label: "Terreiro", href: "/terreiro", restrictedTo: ["owner"] },
      { type: "link", label: "Criar APP", href: "/criar-app", restrictedTo: ["owner"] },
      { type: "link", label: "Minha assinatura", href: "/minha-assinatura", restrictedTo: ["owner"] },
    ],
  },

    ],
    []
  );

 const [open, setOpen] = useState<Record<string, boolean>>({
  membros: false,
  giras: false,
  config: true,
});


  function isAllowed(item: NavItem) {
    if (item.type === "group") return true;
    if (!item.restrictedTo) return true;
    return item.restrictedTo.includes(role);
  }

  function isActive(href: string) {
    return pathname === href;
  }

  function groupHasActive(children: NavItem[]) {
    return children.some((c) => c.type === "link" && isActive(c.href));
  }

  return (
    <aside className="appSidebar">
      <div className="appSidebarTop">
        <div className="appLogo">⟡</div>
        <div className="appBrand">
          <div className="appBrandName">Zellador</div>
          <div className="appBrandSub">App do Terreiro</div>
        </div>
      </div>

      <nav className="appNav">
        {nav.map((item) => {
          if (item.type === "link") {
            const allowed = isAllowed(item);
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={allowed ? item.href : "#"}
                aria-disabled={!allowed}
                className={[
                  "appNavItem",
                  active ? "isActive" : "",
                  !allowed ? "isDisabled" : "",
                ].join(" ")}
                onClick={(e) => {
                  if (!allowed) e.preventDefault();
                }}
                title={!allowed ? "Disponível apenas para alguns perfis" : item.label}
              >
                <span>{item.label}</span>
                {!allowed && <span className="badgeLock">Restrito</span>}
              </Link>
            );
          }

          const expanded = open[item.key] ?? false;
          const hasActive = groupHasActive(item.children);

          return (
            <div key={item.key} className="appNavGroup">
              <button
                type="button"
                className={["appNavGroupBtn", hasActive ? "isActiveGroup" : ""].join(" ")}
                onClick={() => setOpen((s) => ({ ...s, [item.key]: !expanded }))}
              >
                <span>{item.label}</span>
                <span className="chev">{expanded ? "▾" : "▸"}</span>
              </button>

              {expanded && (
                <div className="appNavGroupItems">
                  {item.children
                    .filter(isAllowed)
                    .map((child) => {
                      if (child.type !== "link") return null;
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={["appNavSubItem", active ? "isActive" : ""].join(" ")}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="appSidebarBottom">
        <Link className="appNavItem" href="/">
          Voltar para a landing
        </Link>
      </div>
    </aside>
  );
}

