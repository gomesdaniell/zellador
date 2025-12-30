import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

type UiRole = "medium" | "admin";
type DbRole = "leitura" | "admin";

function mapRole(role: UiRole): DbRole {
  if (role === "medium") return "leitura";
  return "admin";
}

export async function POST(req: Request) {
  const { house_id, role, days } = await req.json();

  if (!house_id) {
    return NextResponse.json({ error: "house_id obrigatório" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const token = nanoid(16).toUpperCase();
  const expires_at =
    typeof days === "number"
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { error } = await supabase.from("invites").insert({
    token,
    house_id,
    role: mapRole(role), // 🔥 AQUI resolve o erro
    expires_at,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return NextResponse.json({
    token,
    link: `${baseUrl}/onboarding/${token}`,
  });
}
