import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2, Loader2, DollarSign, Sparkles, ArrowLeft } from 'lucide-react';
import type { AppUser, UserProfile } from '../types/user';
import { CREDIT_PACKS } from '../types/user';

interface PaymentsProps {
  user: AppUser | null;
  userProfile: UserProfile | null;
  onAuthRequired: () => void;
  onBack: () => void;
}

export default function Payments({ user, userProfile, onAuthRequired, onBack }: PaymentsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoading(packId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: packId,
          userId: user.id,
          email: user.email,
        }),
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analysis
      </button>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Get More Analyses</h2>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
          One-time purchase — no subscription. Your analyses never expire.
        </p>
        {userProfile && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)]">
            <Sparkles className="w-4 h-4" />
            You have {userProfile.credits_remaining} analyses remaining
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {CREDIT_PACKS.map((pack) => (
          <motion.div
            key={pack.id}
            whileHover={{ y: -4 }}
            className={`relative bg-[var(--color-surface-2)] border rounded-2xl p-8 flex flex-col ${
              pack.popular
                ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
                : 'border-[var(--color-border)]'
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--color-accent)] text-[var(--color-surface-0)] text-[10px] font-bold rounded-full uppercase tracking-widest">
                Best Value
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold">{pack.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{pack.tagline}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">${pack.price}</span>
              <span className="text-[var(--color-text-muted)]">one-time</span>
            </div>

            <ul className="flex-1 space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {pack.analyses} stock analyses
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {pack.pricePerAnalysis} per analysis
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                AI recommendations
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Word export
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Never expires
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(pack.id)}
              disabled={loading !== null}
              className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                pack.popular
                  ? 'bg-[var(--color-accent)] text-[var(--color-surface-0)] hover:brightness-110'
                  : 'bg-[var(--color-surface-3)] text-white hover:bg-[var(--color-border-light)]'
              }`}
            >
              {loading === pack.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Buy {pack.name}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="mt-12 text-center space-y-2">
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Secure payment via Stripe</span>
          <span>100% Money-Back Guarantee</span>
          <span>No subscription</span>
        </div>
      </div>
    </div>
  );
}
