import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* =========================
   Utils
========================= */
function slugifyBase(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

/* =========================
   POST /api/houses
========================= */
export async function POST(req: Request) {
  // Next 15: cookies pode ser async
  const cookieStore = await cookies();

  const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          cookies.forEach((c) => cookiesToSet.push(c));
        },
      },
    }
  );

  /* =========================
     Auth
  ========================= */
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
    cookiesToSet.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options)
    );
    return res;
  }

  /* =========================
     Body
  ========================= */
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();

  if (name.length < 2) {
    const res = NextResponse.json(
      { error: "Nome da casa inválido." },
      { status: 400 }
    );
    cookiesToSet.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options)
    );
    return res;
  }

  /* =========================
     Slug único
  ========================= */
  const baseSlug = slugifyBase(name);
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const { data: exists, error } = await supabase
      .from("houses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      const res = NextResponse.json({ error: error.message }, { status: 400 });
      cookiesToSet.forEach(({ name, value, options }) =>
        res.cookies.set(name, value, options)
      );
      return res;
    }

    if (!exists) break;

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  /* =========================
     1) Criar casa
  ========================= */
  const { data: house, error: e1 } = await supabase
    .from("houses")
    .insert({
      name,
      slug,
      owner_id: auth.user.id, // ESSENCIAL p/ RLS
    })
    .select("id")
    .single();

  if (e1) {
    const res = NextResponse.json({ error: e1.message }, { status: 400 });
    cookiesToSet.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options)
    );
    return res;
  }

  /* =========================
     2
