import { motion } from 'motion/react';
import { Award, TrendingUp, DollarSign, Banknote, Calendar, Sparkles, BookOpen } from 'lucide-react';
import type { StockSnapshot, AIRecommendation, Methodology } from '../types/stock';
import { formatPrice, pctFmt, ratingColor } from '../lib/formatters';

interface ExecutiveSummaryProps {
  snapshots: StockSnapshot[];
  recommendations: Record<string, AIRecommendation>;
  methodology: Methodology;
  comparativeAnalysis: string | null;
}

function ratingBorderColor(rating: string): string {
  const r = rating.toUpperCase();
  if (r === 'BUY') return 'border-emerald-500/40';
  if (r === 'SELL') return 'border-red-500/40';
  return 'border-yellow-500/40';
}

export default function ExecutiveSummary({ snapshots, recommendations, methodology }: ExecutiveSummaryProps) {
  if (snapshots.length === 0) return null;

  // Best performer (highest YTD%)
  const bestPerformer = [...snapshots]
    .filter((s) => s.changes.ytd_pct != null)
    .sort((a, b) => (b.changes.ytd_pct ?? -Infinity) - (a.changes.ytd_pct ?? -Infinity))[0];

  // Best value (lowest positive P/E)
  const bestValue = [...snapshots]
    .filter((s) => s.trailing_pe != null && s.trailing_pe > 0)
    .sort((a, b) => (a.trailing_pe ?? Infinity) - (b.trailing_pe ?? Infinity))[0];

  // Strongest cash flow (highest FCF yield)
  const bestCashFlow = [...snapshots]
    .filter((s) => s.cash_flow.fcf_yield != null)
    .sort((a, b) => (b.cash_flow.fcf_yield ?? -Infinity) - (a.cash_flow.fcf_yield ?? -Infinity))[0];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-1)] border border-[var(--color-accent)]/20 rounded-2xl overflow-hidden"
    >
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-emerald-500 to-[var(--color-accent-dim)]" />

      <div className="px-6 py-5 space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Executive Summary</h2>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <Calendar className="w-3 h-3" />
                {dateStr}
                <span className="mx-1">·</span>
                {methodology === 'Growth & Quality' ? (
                  <Sparkles className="w-3 h-3" />
                ) : (
                  <BookOpen className="w-3 h-3" />
                )}
                {methodology}
                <span className="mx-1">·</span>
                {snapshots.length} stock{snapshots.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Rating pills */}
        <div className="flex flex-wrap gap-2">
          {snapshots.map((s) => {
            const rec = recommendations[s.ticker];
            const rating = rec?.rating || 'N/A';
            const colorClass = rec ? ratingColor(rating) : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
            const borderClass = rec ? ratingBorderColor(rating) : 'border-zinc-500/30';
            return (
              <div
                key={s.ticker}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${borderClass} bg-[var(--color-surface-1)]`}
              >
                <span className="font-bold font-mono text-sm">{s.ticker}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colorClass}`}>
                  {rating === 'ERROR' ? 'N/A' : rating}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{formatPrice(s.price)}</span>
              </div>
            );
          })}
        </div>

        {/* Key Highlights */}
        {snapshots.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bestPerformer && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50">
                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[var(--color-text-muted)]">Best Performer (YTD)</div>
                  <div className="font-bold text-sm truncate">
                    {bestPerformer.ticker}{' '}
                    <span className="text-emerald-400 font-mono">{pctFmt(bestPerformer.changes.ytd_pct)}</span>
                  </div>
                </div>
              </div>
            )}
            {bestValue && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50">
                <DollarSign className="w-5 h-5 text-yellow-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[var(--color-text-muted)]">Best Value (P/E)</div>
                  <div className="font-bold text-sm truncate">
                    {bestValue.ticker}{' '}
                    <span className="text-yellow-400 font-mono">{bestValue.trailing_pe?.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            )}
            {bestCashFlow && (
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50">
                <Banknote className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-[var(--color-text-muted)]">Strongest Cash Flow</div>
                  <div className="font-bold text-sm truncate">
                    {bestCashFlow.ticker}{' '}
                    <span className="text-cyan-400 font-mono">{bestCashFlow.cash_flow.fcf_yield?.toFixed(2)}% FCF</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
