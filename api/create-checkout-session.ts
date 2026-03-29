import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, userId, email } = req.body;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const priceId =
      planId === 'pro'
        ? process.env.VITE_STRIPE_PRICE_ID_PRO
        : process.env.VITE_STRIPE_PRICE_ID_STARTER;

    if (!priceId) {
      throw new Error(`Price ID for plan '${planId}' is not configured.`);
    }

    const appUrl = process.env.VITE_APP_URL || 'https://aistockassist.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payments`,
      customer_email: email,
      metadata: { userId, planId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
}
