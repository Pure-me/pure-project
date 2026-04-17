import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, subscription_status')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: profile?.plan || 'solo',
    subscription_status: profile?.subscription_status || 'trialing',
  });
}
