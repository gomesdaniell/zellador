import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase/server";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Nome da casa inválido." }, { status: 400 });
  }

  // 1) cria a casa
  const { data: house, error: e1 } = await supabase
    .from("houses")
    .insert({
      name,
      slug: slugify(name),
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (e1) {
    return NextResponse.json({ error: e1.message }, { status: 400 });
  }

  // 2) vincula usuário na casa (tabela do seu banco: house_users)
  const { error: e2 } = await supabase.from("house_users").insert({
    user_id: auth.user.id,
    house_id: house.id,
    role: "owner",
  });

  if (e2) {
    return NextResponse.json({ error: e2.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, house_id: house.id });
}
