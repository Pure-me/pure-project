import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const isExtendedPlan = (plan: string) => plan?.startsWith('extended');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan || 'monthly';
      if (!userId) break;

      await supabaseAdmin.from('profiles').update({
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan: isExtendedPlan(plan) ? 'extended' : 'solo',
        trial_ends_at: null,
      }).eq('id', userId);

      // Voor extended plan: maak org aan als die nog niet bestaat
      if (isExtendedPlan(plan)) {
        const { data: existingMember } = await supabaseAdmin
          .from('organization_members').select('organization_id').eq('user_id', userId).limit(1).single();

        if (!existingMember) {
          const { data: profile } = await supabaseAdmin
            .from('profiles').select('full_name').eq('id', userId).single();
          const orgName = profile?.full_name ? `${profile.full_name}'s team` : 'Mijn team';
          const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();

          const { data: org } = await supabaseAdmin.from('organizations').insert({
            name: orgName, slug, owner_id: userId,
            plan: 'extended', subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          }).select().single();

          if (org) {
            await supabaseAdmin.from('profiles')
              .update({ current_organization_id: org.id }).eq('id', userId);
          }
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const plan = sub.metadata?.plan || 'monthly';
      if (!userId) break;

      const status = sub.status === 'active' ? 'active'
        : sub.status === 'past_due' ? 'past_due'
        : sub.status === 'canceled' ? 'canceled'
        : sub.status;

      await supabaseAdmin.from('profiles').update({
        subscription_status: status,
        plan: isExtendedPlan(plan) ? 'extended' : 'solo',
      }).eq('id', userId);

      // Sync status naar organisatie
      if (isExtendedPlan(plan)) {
        await supabaseAdmin.from('organizations').update({ subscription_status: status })
          .eq('stripe_subscription_id', sub.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await supabaseAdmin.from('profiles').update({
        subscription_status: 'canceled',
        plan: 'solo',
      }).eq('id', userId);

      await supabaseAdmin.from('organizations').update({ subscription_status: 'canceled' })
        .eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabaseAdmin.from('profiles').update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
