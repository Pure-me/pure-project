import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, subscription_status, stripe_customer_id, stripe_subscription_id, trial_ends_at')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    plan: profile?.plan || 'solo',
    subscriptionStatus: profile?.subscription_status || 'trialing',
    trialEndsAt: profile?.trial_ends_at || null,
    hasActiveSubscription: profile?.subscription_status === 'active',
  });
}
