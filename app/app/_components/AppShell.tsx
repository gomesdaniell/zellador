"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="z-app">
      <header className="z-topbar">
        <button className="z-burger" onClick={() => setOpen(true)} aria-label="Abrir menu">
          ☰
        </button>

        <div className="z-topbar-title">
          <span className="z-accent">Zellador</span> • Painel
        </div>

        <div className="z-topbar-right">
          {/* depois colocamos avatar/conta/logout */}
          <span className="z-pill">30 dias grátis</span>
        </div>
      </header>

      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <main className="z-content">{children}</main>
    </div>
  );
}
