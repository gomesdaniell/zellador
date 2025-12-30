import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { house_id, role, days } = await req.json();

  if (!house_id) {
    return NextResponse.json({ error: "house_id obrigatório" }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "role obrigatório" }, { status: 400 });
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

  const { data, error } = await supabase
    .from("invites")
    .insert({
      token,
      house_id,
      role,
      expires_at,
      used_at: null,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Erro ao criar convite" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    token: data.token,
    link: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${data.token}`,
  });
}
