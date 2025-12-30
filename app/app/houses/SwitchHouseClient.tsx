"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase/client";

export default function SwitchHouseClient({
  houseId,
  disabled,
}: {
  houseId: string;
  disabled?: boolean;
}) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setActive() {
    if (disabled || loading) return;
    setLoading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        window.location.assign("/login?next=/app/houses");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, active_house_id: houseId }, { onConflict: "id" });

      if (error) throw error;

      router.push("/app/dashboard");
      router.refresh();
    } catch (e) {
      // fallback simples
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={setActive}
      disabled={disabled || loading}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        fontWeight: 900,
        border: "1px solid rgba(255,255,255,.15)",
        background: disabled ? "rgba(255,255,255,.06)" : "rgba(45,212,191,.20)",
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: 140,
      }}
      title={disabled ? "Esta já é sua casa ativa" : "Usar esta casa"}
    >
      {loading ? "Mudando..." : disabled ? "Em uso" : "Usar agora"}
    </button>
  );
}
