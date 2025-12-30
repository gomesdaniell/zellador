import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // ⚠️ MVP: pega a última casa criada
  const { data, error } = await supabase
    .from("houses")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Casa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ house_id: data.id });
}
