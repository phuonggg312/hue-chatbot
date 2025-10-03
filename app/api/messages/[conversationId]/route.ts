// app/api/messages/[conversationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

/* ========================= GET: lấy messages của 1 conversation ========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", params.conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Chuẩn hoá payload cho client
    const messages = (data ?? []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system",
      text: m.content,
      created_at: m.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

/* ========================= POST: thêm 1 message & trả về { id } ========================= */
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // bắt buộc đăng nhập (RLS cũng chặn, nhưng báo rõ ràng hơn)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, text } = body as { role: "user" | "bot" | "assistant" | "system"; text: string };

    // Chuẩn hoá "bot" -> "assistant"
    const finalRole = role === "bot" ? "assistant" : role;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    if (!["user", "assistant", "system"].includes(finalRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Ghi message và chỉ select id để nhẹ payload
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: params.conversationId,
        role: finalRole,
        content: text,
      })
      .select("id")
      .single();

    if (error) {
      // Thường là do RLS: conversation không thuộc user hiện tại
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Cập nhật mốc thời gian cuộc trò chuyện (không critical, lỗi cũng bỏ qua)
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", params.conversationId);

    // ✅ Trả về id để client gán vào state (phục vụ like/dislike)
    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
