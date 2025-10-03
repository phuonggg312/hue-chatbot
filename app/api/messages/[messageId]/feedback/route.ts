import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: NextRequest, { params }: { params: { messageId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { reaction } = await req.json() as { reaction: 'like' | 'dislike' };
  const message_id = params.messageId;

  const { error } = await supabase
    .from('message_feedback')
    .upsert(
      { message_id, user_id: user.id, reaction },
      { onConflict: 'message_id,user_id' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
