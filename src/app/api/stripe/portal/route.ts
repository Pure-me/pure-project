import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

export async function POST() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('stripe_customer_id').eq('id', user.id).single();

  if (!profile?.stripe_customer_id)
    return NextResponse.json({ error: 'Geen actief abonnement gevonden' }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
