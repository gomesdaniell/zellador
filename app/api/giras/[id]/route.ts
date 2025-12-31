import { NextResponse } from 'next/server';
import type { RouteContext } from 'next';
import { createSupabaseServer } from '@/lib/supabase/server';

type Ctx = RouteContext<{ id: string }>;

export async function PATCH(req: Request, ctx: Ctx) {
  const supabase = createSupabaseServer();
  const body = await req.json();
  const { id } = ctx.params;

  const { data, error } = await supabase
    .from('giras')
    .update({
      data: body.data,
      inicio: body.inicio,
      fim: body.fim,
      tipo: body.tipo,
      status: body.status,
      titulo: body.titulo,
      observacoes: body.observacoes ?? null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const supabase = createSupabaseServer();
  const { id } = ctx.params;

  const { error } = await supabase.from('giras').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
