import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
  // Next 15: cookies() pode ser async dependendo da versão/runtime
  const cookieStore = await cookies();

  // Vamos capturar cookies que o Supabase quiser atualizar
  const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(c) {
          c.forEach((cookie) => cookiesToSet.push(cookie));
        },
      },
    }
  );

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();

  if (name.length < 2) {
    const res = NextResponse.json({ error: "Nome da casa inválido." }, { status: 400 });
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  // 1) cria a casa
  const { data: house, error: e1 } = await supabase
  .from("houses")
  .insert({
    name,
    slug: slugify(name),
    owner_id: auth.user.id, // 🔑 ESSENCIAL
  })
  .select("id")
  .single();


  if (e1) {
    const res = NextResponse.json({ error: e1.message }, { status: 400 });
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  // 2) vincula usuário na casa
  const { error: e2 } = await supabase.from("house_users").insert({
    user_id: auth.user.id,
    house_id: house.id,
    role: "owner",
  });

  if (e2) {
    const res = NextResponse.json({ error: e2.message }, { status: 400 });
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
    return res;
  }

  const res = NextResponse.json({ ok: true, house_id: house.id });
  cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}
