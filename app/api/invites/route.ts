import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { house_id, role, days } = await req.json();

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const token = nanoid(16).toUpperCase();
  const expires_at = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from("invites").insert({
    token,
    house_id,
    role,
    expires_at,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    token,
    link: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${token}`,
  });
}
