import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

const PRICES: Record<string, string> = {
  monthly:           process.env.STRIPE_PRICE_MONTHLY!,
  yearly:            process.env.STRIPE_PRICE_YEARLY!,
  extended_monthly:  process.env.NEXT_PUBLIC_STRIPE_PRICE_EXTENDED_MONTHLY!,
  extended_yearly:   process.env.NEXT_PUBLIC_STRIPE_PRICE_EXTENDED_YEARLY!,
};

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { plan } = await req.json();
  const priceId = PRICES[plan];
  if (!priceId) return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 });

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('stripe_customer_id, full_name').eq('id', user.id).single();

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
  const email = authUser?.user?.email;

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: email || undefined, name: profile?.full_name || undefined, metadata: { supabase_user_id: user.id } });
    customerId = customer.id;
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: { metadata: { supabase_user_id: user.id, plan } },
  });

  return NextResponse.json({ url: session.url });
}
