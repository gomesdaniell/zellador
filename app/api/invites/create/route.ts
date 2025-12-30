import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function makeToken() {
  // token curto, fácil de copiar, mas ainda imprevisível
  return (
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { house_id, role } = body as { house_id: string; role: "medium" | "consulente" };

    if (!house_id || !role) {
      return NextResponse.json({ error: "house_id e role são obrigatórios" }, { status: 400 });
    }

    // Service role (server only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // precisa existir no env
    );

    const token = makeToken();

    const { data, error } = await supabase
      .from("invites")
      .insert({
        house_id,
        role,
        token,
        // opcional: expirar em 7 dias
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, token, house_id, role, expires_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const link = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${token}`;

    return NextResponse.json({ invite: data, link });
  } catch (e: any) {
    return NextResponse.json({ error: "Falha ao criar convite" }, { status: 500 });
  }
}
