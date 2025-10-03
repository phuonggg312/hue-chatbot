// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ conversations: [] });

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at, last_message_at, user_id")
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id, // NHỚ gán user_id để RLS không chặn
      title: (title ?? "Cuộc trò chuyện mới").slice(0, 120),
      last_message_at: new Date().toISOString(),
    })
    .select("id, title, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data }, { status: 201 });
}
