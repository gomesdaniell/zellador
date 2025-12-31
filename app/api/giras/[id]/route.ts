import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const supabase = createSupabaseServer();
  const body = await req.json();

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
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const supabase = createSupabaseServer();

  const { error } = await supabase.from('giras').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
