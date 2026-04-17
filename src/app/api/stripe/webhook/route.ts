import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

async function updateSubscription(userId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id || '';
  let plan = 'solo';
  if (priceId === process.env.STRIPE_PRICE_EXTENDED_MONTHLY) plan = 'extended_monthly';
  else if (priceId === process.env.STRIPE_PRICE_EXTENDED_YEARLY) plan = 'extended_yearly';
  else if (sub.items.data[0]?.price?.recurring?.interval === 'year') plan = 'yearly';
  else plan = 'monthly';

  const status = sub.status === 'active' ? 'active'
    : sub.status === 'trialing' ? 'trialing'
    : sub.status === 'past_due' ? 'past_due'
    : sub.status === 'canceled' ? 'canceled'
    : sub.status === 'unpaid' ? 'blocked'
    : sub.status;

  await supabaseAdmin
    .from('profiles')
    .update({ stripe_subscription_id: sub.id, subscription_status: status, plan })
    .eq('id', userId);
}

async function getActiveSubForCustomer(customerId: string): Promise<Stripe.Subscription | null> {
  const { data } = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
  return data[0] ?? null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = session.metadata?.userId || sub.metadata?.userId
          || await getUserIdByCustomer(session.customer as string);
        if (userId) await updateSubscription(userId, sub);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId || await getUserIdByCustomer(sub.customer as string);
        if (userId) await updateSubscription(userId, sub);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId || await getUserIdByCustomer(sub.customer as string);
        if (userId) {
          await supabaseAdmin.from('profiles')
            .update({ subscription_status: 'canceled', stripe_subscription_id: null, plan: 'solo' })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;
        const sub = await getActiveSubForCustomer(customerId);
        if (sub) await updateSubscription(userId, sub);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = await getUserIdByCustomer(invoice.customer as string);
        if (!userId) break;
        const attemptCount = invoice.attempt_count ?? 1;
        await supabaseAdmin.from('profiles')
          .update({ subscription_status: attemptCount >= 3 ? 'blocked' : 'past_due' })
          .eq('id', userId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
