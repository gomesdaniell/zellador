import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request, context: any) {
  const token = context?.params?.token as string;

  const body = await req.json().catch(() => ({}));
  const { name, whatsapp, email, password, acceptRules, acceptLgpd } = body ?? {};

  if (!name?.trim()) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Informe seu e-mail." }, { status: 400 });
  if (!password || String(password).length < 6)
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  if (!acceptRules) return NextResponse.json({ error: "Você precisa aceitar as regras da casa." }, { status: 400 });
  if (!acceptLgpd) return NextResponse.json({ error: "Você precisa concordar com o uso dos dados (LGPD)." }, { status: 400 });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 1) valida convite
  const { data: invite, error: invErr } = await supabase
    .from("invites")
    .select("id, token, house_id, role, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });
  if (!invite) return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  if (invite.used_at) return NextResponse.json({ error: "Este convite já foi utilizado." }, { status: 409 });
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now())
    return NextResponse.json({ error: "Este convite expirou." }, { status: 410 });

  // 2) cria usuário
  const { data: created, error: createUserErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (createUserErr || !created.user) {
    return NextResponse.json({ error: createUserErr?.message || "Falha ao criar usuário." }, { status: 500 });
  }

  const userId = created.user.id;

  // 3) upsert profile
  const { error: profErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      active_house_id: invite.house_id,
      access_level: "USER",
    },
    { onConflict: "id" }
  );
  if (profErr) return NextResponse.json({ error: "Usuário criado, mas falhou ao configurar perfil." }, { status: 500 });

  // 4) cria member
  const { error: memErr } = await supabase.from("members").insert({
    house_id: invite.house_id,
    user_id: userId,
    role: invite.role,
    name,
    whatsapp: whatsapp ?? null,
    email,
    active: true,
    consents: {
      rules: true,
      lgpd: true,
      created_from: "invite",
      invite_id: invite.id,
    },
  });
  if (memErr) return NextResponse.json({ error: "Perfil criado, mas falhou ao salvar cadastro." }, { status: 500 });

  // 5) marca convite como usado
  await supabase.from("invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

  return NextResponse.json({ ok: true }, { status: 200 });
}

