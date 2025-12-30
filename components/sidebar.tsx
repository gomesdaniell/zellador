"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem =
  | { type: "link"; label: string; href: string; icon?: React.ReactNode }
  | {
      type: "group";
      label: string;
      icon?: React.ReactNode;
      children: { label: string; href: string; icon?: React.ReactNode }[];
    };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();

  const nav: NavItem[] = useMemo(
    () => [
      { type: "link", label: "Home", href: "/home" },

      {
        type: "group",
        label: "Membros",
        children: [
          { label: "Médiuns", href: "/membros/mediuns" },
          { label: "Consulentes", href: "/membros/consulentes" },
        ],
      },

      { type: "link", label: "Giras", href: "/giras" },
      { type: "link", label: "Camarinha", href: "/camarinha" },
      { type: "link", label: "Eventos", href: "/eventos" },
      { type: "link", label: "Arrecadação", href: "/arrecadacao" },
      { type: "link", label: "Pontos", href: "/pontos" },
      { type: "link", label: "Agenda", href: "/agenda" },
      { type: "link", label: "Comunicados", href: "/comunicados" },
      { type: "link", label: "Pedido de reza", href: "/pedido-de-reza" },
    ],
    []
  );

  const isInMembers = pathname?.startsWith("/membros");

  const [membersOpen, setMembersOpen] = useState<boolean>(false);

  // abre automaticamente quando estiver em /membros/*
  useEffect(() => {
    if (isInMembers) setMembersOpen(true);
  }, [isInMembers]);

  return (
    <aside className="w-[260px] border-r bg-white h-screen sticky top-0">
      <div className="h-14 px-4 flex items-center gap-2 border-b">
        <div className="font-semibold">TUFDS</div>
      </div>

      <nav className="px-2 py-3 text-sm">
        <ul className="space-y-1">
          {nav.map((item) => {
            if (item.type === "link") {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50",
                      active && "bg-gray-100 font-medium"
                    )}
                  >
                    <span className="h-4 w-4 rounded bg-gray-200" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            }

            // group
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setMembersOpen((s) => !s)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50",
                    isInMembers && "bg-gray-100 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-gray-200" />
                    <span>{item.label}</span>
                  </span>

                  <span className={cn("text-gray-500 transition", membersOpen && "rotate-180")}>
                    ▾
                  </span>
                </button>

                {membersOpen && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {item.children.map((child) => {
                      const active = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50",
                              active && "bg-gray-100 font-medium"
                            )}
                          >
                            <span className="h-4 w-4 rounded bg-gray-200" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
