import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Credit amounts per plan
const PLAN_CREDITS: Record<string, number> = {
  starter: 20,
  pro: 50,
};

// Price amounts in cents
const PLAN_PRICES: Record<string, number> = {
  starter: 499,
  pro: 999,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  if (!stripeKey || !sig || !webhookSecret) {
    return res.status(400).send('Missing configuration');
  }

  const stripe = new Stripe(stripeKey);
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId || 'starter';

      if (userId) {
        const creditsToAdd = PLAN_CREDITS[planId] || 20;
        const priceCents = PLAN_PRICES[planId] || 499;

        // Get current profile
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('credits_remaining, credits_lifetime, total_purchases, total_spent_cents')
          .eq('id', userId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              credits_remaining: (profile.credits_remaining || 0) + creditsToAdd,
              credits_lifetime: (profile.credits_lifetime || 0) + creditsToAdd,
              total_purchases: (profile.total_purchases || 0) + 1,
              total_spent_cents: (profile.total_spent_cents || 0) + priceCents,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId);

          console.log(`Added ${creditsToAdd} credits to user ${userId} (${planId})`);
        }
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Processing Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
