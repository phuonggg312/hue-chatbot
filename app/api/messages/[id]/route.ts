import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { value } = await req.json(); // 'like' | 'dislike'
    const supabase = createRouteHandlerClient({ cookies });

    // Lấy user hiện tại
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Ghi/ghi đè feedback (1 user chỉ 1 feedback cho 1 message)
    const { error } = await supabase
      .from('message_feedback')
      .upsert(
        {
          message_id: params.id,
          user_id: user.id,
          value, // 'like' | 'dislike'
        },
        { onConflict: 'message_id,user_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
