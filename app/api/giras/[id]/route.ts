import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
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
    .eq('id', ctx.params.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
