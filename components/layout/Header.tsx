"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Header() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700 }}>Área do App</div>
        <div className="muted">Sem www • zellador.com.br</div>
      </div>

      <button onClick={logout}>Sair</button>
    </header>
  );
}
