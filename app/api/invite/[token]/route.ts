import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Ctx = {
  params: Promise<{ token: string }>;
};

export async function GET(req: Request, ctx: Ctx) {
  const { token } = await ctx.params;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("invites")
    .select("id, token, role, house_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (data.used_at) {
    return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
  }

  return NextResponse.json({
    id: data.id,
    token: data.token,
    role: data.role,
    house_id: data.house_id,
  });
}

