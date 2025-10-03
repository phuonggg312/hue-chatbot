// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: uErr } = await supabase.auth.getUser();
  if (uErr || !user) return NextResponse.json({ conversations: [] });

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ conversations: [], error }, { status: 500 });
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title: title || "Cuộc trò chuyện mới" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ conversation: data });
}
