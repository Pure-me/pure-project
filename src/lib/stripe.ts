import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export const PRICES: Record<string, string> = {
  monthly:           process.env.STRIPE_PRICE_MONTHLY!,
  yearly:            process.env.STRIPE_PRICE_YEARLY!,
  extended_monthly:  process.env.STRIPE_PRICE_EXTENDED_MONTHLY!,
  extended_yearly:   process.env.STRIPE_PRICE_EXTENDED_YEARLY!,
};

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pure-project.pureexcellence.be';
