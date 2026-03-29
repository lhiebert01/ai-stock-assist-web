import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, TrendingDown, Globe, Building2, Factory,
  DollarSign, BarChart3, Activity, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { StockSnapshot, AIRecommendation, Methodology } from '../types/stock';
import { formatPrice, humanMoney, pctFmt, changeColor, ratingColor } from '../lib/formatters';
import PriceChart from './PriceChart';
import RecommendationCard from './RecommendationCard';

interface StockCardProps {
  snapshot: StockSnapshot;
  recommendation?: AIRecommendation;
  methodology: Methodology;
}

function MetricRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/50 last:border-0">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium">{value}</span>
        {sub && <span className="text-xs text-[var(--color-text-muted)] ml-1">{sub}</span>}
      </div>
    </div>
  );
}

export default function StockCard({ snapshot, recommendation, methodology }: StockCardProps) {
  const [expanded, setExpanded] = useState(true);
  const s = snapshot;
  const ch = s.changes;
  const cf = s.cash_flow;
  const sm = s.screening_metrics;

  const analystRating = s.analyst.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';
  const bsHealth = sm.balance_sheet_health;
  const bsGrade =
    bsHealth == null ? '—' : bsHealth >= 80 ? 'A' : bsHealth >= 60 ? 'B' : bsHealth >= 40 ? 'C' : bsHealth >= 20 ? 'D' : 'F';

  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--color-accent)]">{s.ticker.slice(0, 3)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">{s.ticker}</h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${ratingColor(analystRating)}`}>
                {analystRating}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] truncate">{s.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xl font-bold font-mono">{formatPrice(s.price)}</div>
            <div className={`text-sm font-medium ${changeColor(ch.daily_pct)}`}>
              {ch.daily_pct != null && ch.daily_pct >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 inline mr-1" />
              )}
              {pctFmt(ch.daily_pct)} today
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {/* Price on mobile */}
              <div className="sm:hidden flex items-center justify-between">
                <span className="text-2xl font-bold font-mono">{formatPrice(s.price)}</span>
                <span className={`text-sm font-medium ${changeColor(ch.daily_pct)}`}>
                  {pctFmt(ch.daily_pct)} today
                </span>
              </div>

              {/* AI Summary */}
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                {s.what_it_does}
              </p>

              {/* Company Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                {s.exchange && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-surface-3)] rounded-lg">
                    <Building2 className="w-3 h-3" /> {s.exchange}
                  </span>
                )}
                {s.sector && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-surface-3)] rounded-lg">
                    <Factory className="w-3 h-3" /> {s.sector}
                  </span>
                )}
                {s.website && (
                  <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-surface-3)] rounded-lg hover:text-[var(--color-accent)] transition-colors">
                    <Globe className="w-3 h-3" /> Website <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* Chart */}
              <PriceChart ticker={s.ticker} />

              {/* Performance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Daily', value: ch.daily_pct },
                  { label: 'Monthly', value: ch.m_window_pct },
                  { label: 'YTD', value: ch.ytd_pct },
                  { label: '1 Year', value: ch.y1_pct },
                ].map((p) => (
                  <div key={p.label} className="bg-[var(--color-surface-1)] rounded-xl p-3 border border-[var(--color-border)]/50">
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">{p.label}</div>
                    <div className={`text-lg font-bold font-mono ${changeColor(p.value)}`}>
                      {pctFmt(p.value)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Metrics Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fundamentals */}
                <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[var(--color-accent)]" />
                    <h4 className="text-sm font-bold">Fundamentals</h4>
                  </div>
                  <MetricRow label="Market Cap" value={humanMoney(s.market_cap)} />
                  <MetricRow label="Revenue" value={humanMoney(s.latest_revenue)} />
                  <MetricRow label="P/E Ratio" value={s.trailing_pe != null ? `${s.trailing_pe.toFixed(2)}x` : '—'} />
                  <MetricRow label="P/B Ratio" value={sm.price_to_book != null ? `${sm.price_to_book.toFixed(2)}x` : '—'} />
                  <MetricRow label="ROE" value={sm.return_on_equity != null ? `${(sm.return_on_equity * 100).toFixed(1)}%` : '—'} />
                  <MetricRow label="Profit Margin" value={sm.profit_margin != null ? `${(sm.profit_margin * 100).toFixed(1)}%` : '—'} />
                </div>

                {/* Cash Flow */}
                <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-[var(--color-accent)]" />
                    <h4 className="text-sm font-bold">Cash Flow Quality</h4>
                  </div>
                  <MetricRow label="FCF Yield" value={cf.fcf_yield != null ? `${cf.fcf_yield.toFixed(2)}%` : '—'} />
                  <MetricRow label="P/FCF" value={cf.p_fcf != null ? `${cf.p_fcf.toFixed(2)}x` : '—'} />
                  <MetricRow
                    label="OCF/NI Ratio"
                    value={cf.ocf_to_ni_ratio != null ? `${cf.ocf_to_ni_ratio.toFixed(2)}x` : '—'}
                    sub={cf.ocf_to_ni_ratio != null ? (cf.ocf_to_ni_ratio >= 1.0 ? 'Strong' : 'Weak') : undefined}
                  />
                  <MetricRow label="Free Cash Flow" value={humanMoney(cf.free_cash_flow)} />
                  <MetricRow label="Operating CF" value={humanMoney(cf.operating_cash_flow)} />
                  <MetricRow label="Net Income" value={humanMoney(cf.net_income)} />
                </div>

                {/* Balance Sheet & Trading */}
                <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-[var(--color-accent)]" />
                    <h4 className="text-sm font-bold">Balance Sheet</h4>
                  </div>
                  <MetricRow label="Health Grade" value={bsGrade} sub={bsHealth != null ? `${bsHealth}/100` : undefined} />
                  <MetricRow label="Current Ratio" value={sm.current_ratio != null ? `${sm.current_ratio.toFixed(2)}x` : '—'} />
                  <MetricRow label="Debt/Equity" value={sm.debt_to_equity != null ? `${sm.debt_to_equity.toFixed(2)}` : '—'} />
                  <MetricRow label="Quick Ratio" value={sm.quick_ratio != null ? `${sm.quick_ratio.toFixed(2)}x` : '—'} />
                  <MetricRow label="Div Yield" value={sm.dividend_yield != null ? `${(sm.dividend_yield * 100).toFixed(2)}%` : '—'} />
                  <MetricRow label="52W Range" value={`${formatPrice(s.panel.low_52w)} – ${formatPrice(s.panel.high_52w)}`} />
                </div>
              </div>

              {/* AI Recommendation */}
              {recommendation && (
                <RecommendationCard recommendation={recommendation} methodology={methodology} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
