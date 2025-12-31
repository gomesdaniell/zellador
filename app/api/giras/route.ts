import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const casa_id = searchParams.get('casa_id');

  if (!casa_id) {
    return NextResponse.json({ error: 'casa_id obrigatório' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('giras')
    .select('*')
    .eq('casa_id', casa_id)
    .order('data', { ascending: true })
    .order('inicio', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const body = await req.json().catch(() => null);

  const required = ['casa_id', 'data', 'inicio', 'fim', 'tipo', 'status', 'titulo'] as const;
  for (const k of required) {
    if (!body?.[k]) {
      return NextResponse.json({ error: `Campo obrigatório: ${k}` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('giras')
    .insert({
      casa_id: body.casa_id,
      data: body.data,
      inicio: body.inicio,
      fim: body.fim,
      tipo: body.tipo,
      status: body.status,
      titulo: body.titulo,
      observacoes: body.observacoes ?? null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
