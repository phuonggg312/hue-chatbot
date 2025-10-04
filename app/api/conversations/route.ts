// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

type AssistantType = 'hoc_tap' | 'tuyen_sinh';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ conversations: [] });

  const { data, error } = await supabase
    .from('conversations')
    // ✅ select thêm assistant_type
    .select('id, title, created_at, updated_at, last_message_at, user_id, assistant_type')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title: string | undefined = body?.title;
  const assistant_type: AssistantType = (body?.assistant_type ?? 'tuyen_sinh') as AssistantType;

  // ✅ validate assistant_type
  if (!['hoc_tap', 'tuyen_sinh'].includes(assistant_type)) {
    return NextResponse.json({ error: 'assistant_type invalid' }, { status: 400 });
  }

  const defaultTitle =
    title?.trim() ||
    (assistant_type === 'hoc_tap' ? 'Hỗ trợ người học' : 'Tư vấn tuyển sinh');

  const { data, error } = await supabase
    .from('conversations')
    // ✅ insert kèm assistant_type
    .insert({ user_id: user.id, title: defaultTitle, assistant_type })
    .select('id, title, created_at, updated_at, last_message_at, assistant_type')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}

// ✅ ĐỔI TÊN (không cho đổi assistant_type ở đây)
export async function PUT(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, title } = await req.json();
  if (!id || !title) {
    return NextResponse.json({ error: 'Missing id or title' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, title, assistant_type')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}
