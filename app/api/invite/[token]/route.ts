import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(_req: Request, context: any) {
  const token = context.params.token;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  return NextResponse.json({ invite: data });
}
