export interface AppUser {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  credits_remaining: number;
  credits_lifetime: number;
  stripe_customer_id: string | null;
  total_purchases: number;
  total_spent_cents: number;
  analyses_total_lifetime: number;
  unique_tickers_lifetime: number;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

export interface CreditPack {
  id: string;
  name: string;
  tagline: string;
  price: number;
  analyses: number;
  pricePerAnalysis: string;
  stripePriceId: string;
  popular: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tagline: 'Try it out',
    price: 4.99,
    analyses: 20,
    pricePerAnalysis: '$0.25',
    stripePriceId: 'price_1TG1j6G2UTIPy8Q7DhdWbVi2',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    tagline: 'Best value',
    price: 9.99,
    analyses: 50,
    pricePerAnalysis: '$0.20',
    stripePriceId: 'price_1TG1e1G2UTIPy8Q7Qrbjx7sw',
    popular: true,
  },
];
