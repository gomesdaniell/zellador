"use client";

import { supabaseBrowser } from "../../lib/supabase/client";

export default function AppHeader() {
  const supabase = supabaseBrowser();

  async function logout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <strong>Zellador</strong>

      <button
        onClick={logout}
        style={{
          padding: "6px 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.15)",
          background: "rgba(255,255,255,.06)",
          cursor: "pointer",
        }}
      >
        Sair
      </button>
    </header>
  );
}
