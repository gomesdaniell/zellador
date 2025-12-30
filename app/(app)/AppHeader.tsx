"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";

type HouseLite = { id: string; name: string; slug?: string };

export default function AppHeader() {
  const supabase = supabaseBrowser();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [house, setHouse] = useState<HouseLite | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function loadContext() {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (!user) {
        setHouse(null);
        setUserEmail(null);
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("active_house_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) throw profErr;

      const activeHouseId = prof?.active_house_id ?? null;

      if (!activeHouseId) {
        setHouse(null);
        setLoading(false);
        return;
      }

      const { data: h, error: hErr } = await supabase
        .from("houses")
        .select("id,name,slug")
        .eq("id", activeHouseId)
        .maybeSingle();

      if (hErr) throw hErr;

      setHouse(h ? { id: h.id, name: h.name, slug: h.slug } : null);
    } catch {
      // se falhar, mantém header simples
      setHouse(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContext();

    // Atualiza automaticamente quando troca login/sessão
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadContext();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  const onHouses = pathname?.startsWith("/app/houses");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(2, 6, 23, 0.70)", // escuro translúcido (combina com o padrão)
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Esquerda */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/app/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Zellador</div>
          </Link>

          <div
            style={{
              width: 1,
              height: 18,
              background: "rgba(255,255,255,.18)",
            }}
          />

          <div style={{ opacity: 0.9 }}>
            {loading ? (
              <span style={{ opacity: 0.75 }}>Carregando casa…</span>
            ) : house ? (
              <>
                Casa ativa: <b>{house.name}</b>
              </>
            ) : (
              <span style={{ opacity: 0.75 }}>Sem casa ativa</span>
            )}
          </div>
        </div>

        {/* Direita */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {userEmail && (
            <span style={{ opacity: 0.65, fontSize: 13, display: "none" }}>
              {userEmail}
            </span>
          )}

          <Link
            href="/app/houses"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,.15)",
              background: onHouses ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.06)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Trocar casa
          </Link>

          <button
            onClick={logout}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              fontWeight: 900,
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.06)",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
