import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { stripe, PRICES, APP_URL } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

  const { plan } = await req.json();
  if (!['monthly', 'yearly', 'extended_monthly', 'extended_yearly'].includes(plan)) {
    return NextResponse.json({ error: 'Ongeldig plan' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id, email, name')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.name || user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  const priceId = PRICES[plan as keyof typeof PRICES];
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price ID niet geconfigureerd' }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${APP_URL}/dashboard/billing?canceled=1`,
    subscription_data: { metadata: { userId: user.id } },
    allow_promotion_codes: true,
    locale: 'nl',
  });

  return NextResponse.json({ url: session.url });
}
