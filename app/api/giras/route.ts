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

  return NextResponse.json(data);
}
