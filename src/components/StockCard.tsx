import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, TrendingDown, Globe, Building2, Factory,
  DollarSign, BarChart3, Activity, ChevronDown, ChevronUp,
  ExternalLink, AlertTriangle, Bookmark,
} from 'lucide-react';
import type { StockSnapshot, AIRecommendation, Methodology } from '../types/stock';
import { formatPrice, humanMoney, pctFmt, changeColor, ratingColor, isFiniteNum } from '../lib/formatters';
import PriceChart from './PriceChart';
import RecommendationCard from './RecommendationCard';
import VerdictReconciliation from './VerdictReconciliation';

interface StockCardProps {
  snapshot: StockSnapshot;
  recommendation?: AIRecommendation;
  methodology: Methodology;
  hideChart?: boolean;
  /** Watchlist wiring — omitted (undefined) when watchlists aren't available. */
  watched?: boolean;
  onWatchToggle?: () => void;
}

function ratingAccentBorder(rating: string | undefined): string {
  if (!rating) return 'border-l-[var(--color-border-light)]';
  const r = rating.toUpperCase();
  if (r === 'BUY') return 'border-l-emerald-500';
  if (r === 'SELL') return 'border-l-red-500';
  if (r === 'HOLD') return 'border-l-yellow-500';
  if (r === 'NOT_RATED') return 'border-l-zinc-500'; // neutral gray — not a verdict
  return 'border-l-[var(--color-border-light)]';
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

export default function StockCard({ snapshot, recommendation, methodology, hideChart, watched, onWatchToggle }: StockCardProps) {
  const [expanded, setExpanded] = useState(true);
  const s = snapshot;
  // Guard against non-finite P/E that can arrive as the string "Infinity" (crashes .toFixed)
  const peNum = isFiniteNum(s.trailing_pe) && s.trailing_pe > 0 ? s.trailing_pe : null;
  const ch = s.changes;
  const cf = s.cash_flow;
  const sm = s.screening_metrics;

  const analystRating = s.analyst.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';
  const bsHealth = sm.balance_sheet_health;
  const bsGrade =
    bsHealth == null ? '—' : bsHealth >= 80 ? 'A' : bsHealth >= 60 ? 'B' : bsHealth >= 40 ? 'C' : bsHealth >= 20 ? 'D' : 'F';

  return (
    <div className={`bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden border-l-4 ${ratingAccentBorder(recommendation?.rating)}`}>
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
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold border ${ratingColor(analystRating)}`}
                title={`Wall Street analyst consensus${
                  s.analyst.num_analysts ? ` from ${s.analyst.num_analysts} analysts` : ''
                }. This reflects 12-month price targets and earnings momentum — separate from AI Stock Assist's verdict shown below.`}
              >
                Wall St: {analystRating}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] truncate">{s.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Prominent labeled save button — results are lost on navigation, so
              this is the one action that persists a ticker. Amber = save,
              green = saved. */}
          {onWatchToggle && (
            <button
              onClick={(e) => { e.stopPropagation(); onWatchToggle(); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all shrink-0 ${
                watched
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
              }`}
              title={watched ? `${s.ticker} is on your watchlist — click to remove` : `Save ${s.ticker} to your watchlist`}
            >
              <Bookmark className={`w-4 h-4 ${watched ? 'fill-current' : ''}`} />
              <span className="hidden md:inline">{watched ? 'On Watchlist ✓' : 'Save to Watchlist'}</span>
              <span className="md:hidden">{watched ? 'Saved ✓' : 'Save'}</span>
            </button>
          )}
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
              {/* Data-integrity gate notice (WO-ASA-001.1/001.3) */}
              {s.integrity?.status === 'FAIL' && (
                <div className="flex items-start gap-2 rounded-lg border border-zinc-500/40 bg-zinc-500/10 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[var(--color-text-primary)]">Data integrity check failed</span>
                    {' — this stock is Not Rated because its source data contradicts itself'}
                    {s.integrity.failures.length > 0 && <> ({s.integrity.failures[0]})</>}
                    . It is excluded from Top Pick, rankings, and avoid lists. Metrics below are shown for
                    transparency only and should not be relied on.
                  </span>
                </div>
              )}

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

              {/* Analyst Target */}
              {s.analyst.target_price != null && s.price != null && (
                <div className="flex items-center gap-4 px-4 py-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50">
                  <div
                    className="text-sm text-[var(--color-text-secondary)]"
                    title="12-month price target — the average of forecasts published by Wall Street equity analysts covering this stock."
                  >
                    Analyst Target
                  </div>
                  <div className="font-bold font-mono">{formatPrice(s.analyst.target_price)}</div>
                  {(() => {
                    const upside = ((s.analyst.target_price! - s.price!) / s.price!) * 100;
                    return (
                      <span className={`text-sm font-mono font-medium ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {upside >= 0 ? '+' : ''}{upside.toFixed(1)}% {upside >= 0 ? 'upside' : 'downside'}
                      </span>
                    );
                  })()}
                  {s.analyst.num_analysts != null && (
                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">{s.analyst.num_analysts} analysts</span>
                  )}
                </div>
              )}

              {/* Verdict reconciliation — shown only when both ratings are available */}
              <VerdictReconciliation
                analystRaw={s.analyst.recommendation}
                aiRating={recommendation?.rating}
                methodology={methodology}
              />

              {/* Chart */}
              {hideChart ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50 text-sm text-[var(--color-text-muted)]">
                  Price: <span className="font-mono font-bold text-[var(--color-text-primary)]">{formatPrice(s.price)}</span>
                  <span className="ml-1">as of {new Date(s.as_of).toLocaleDateString()}</span>
                </div>
              ) : (
                <PriceChart ticker={s.ticker} />
              )}

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
              <div className={`grid grid-cols-1 gap-4 ${s.growth.cagr_3yr != null || s.growth.revenue_growth != null ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                {/* Fundamentals */}
                <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[var(--color-accent)]" />
                    <h4 className="text-sm font-bold">Fundamentals</h4>
                  </div>
                  <MetricRow label="Market Cap" value={humanMoney(s.market_cap)} />
                  <MetricRow label="Revenue" value={humanMoney(s.latest_revenue)} />
                  <MetricRow
                    label="P/E Ratio"
                    value={peNum != null ? `${peNum.toFixed(2)}x` : 'N/A'}
                    sub={peNum != null ? undefined : (cf.net_income != null && cf.net_income <= 0 ? 'No TTM profit' : 'Unavailable')}
                  />
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
                  <MetricRow
                    label="FCF Yield"
                    value={cf.fcf_yield != null ? `${cf.fcf_yield.toFixed(2)}%` : '—'}
                    sub={cf.free_cash_flow != null && cf.free_cash_flow < 0 ? 'negative FCF' : undefined}
                  />
                  {/* A price multiple over NEGATIVE cash flow is undefined, not a
                      small number — render n/m with the reason (WO-ASA-002.2) */}
                  <MetricRow
                    label="P/FCF"
                    value={cf.p_fcf != null ? `${cf.p_fcf.toFixed(2)}x` : (cf.free_cash_flow != null && cf.free_cash_flow < 0 ? 'n/m' : '—')}
                    sub={cf.p_fcf == null && cf.free_cash_flow != null && cf.free_cash_flow < 0 ? 'negative FCF' : undefined}
                  />
                  <MetricRow
                    label="OCF/NI Ratio"
                    value={cf.ocf_to_ni_ratio != null ? `${cf.ocf_to_ni_ratio.toFixed(2)}x` : '—'}
                    sub={cf.ocf_to_ni_ratio != null ? (cf.ocf_to_ni_ratio >= 1.0 ? 'Quality' : cf.ocf_to_ni_ratio >= 0.8 ? 'Caution' : 'Red Flag') : undefined}
                  />
                  <MetricRow label="Free Cash Flow" value={humanMoney(cf.free_cash_flow)} />
                  <MetricRow label="Operating CF" value={humanMoney(cf.operating_cash_flow)} />
                  {cf.capex != null && <MetricRow label="Capex" value={humanMoney(cf.capex)} />}
                  <MetricRow label="Net Income" value={humanMoney(cf.net_income)} />
                  {/* Capex/FCF bridge (WO-ASA-002.9): shows WHY FCF is what it
                      is — an investment cycle reads very differently from
                      structural decline, and the framework's harshest signals
                      deserve their explanation. */}
                  {cf.operating_cash_flow != null && cf.capex != null && cf.free_cash_flow != null && cf.operating_cash_flow > 0 && (
                    <p className="pt-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
                      Bridge: OCF {humanMoney(cf.operating_cash_flow)} − capex {humanMoney(cf.capex)} = FCF {humanMoney(cf.free_cash_flow)}
                      {' '}· capex is {((cf.capex / cf.operating_cash_flow) * 100).toFixed(0)}% of OCF
                      {cf.capex / cf.operating_cash_flow > 0.5 ? ' — a heavy investment cycle suppresses FCF' : ''}
                    </p>
                  )}
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
                  <MetricRow
                    label="Payout Ratio"
                    value={sm.payout_ratio != null ? `${(sm.payout_ratio * 100).toFixed(0)}%` : '—'}
                    sub={
                      sm.payout_ratio == null
                        ? undefined
                        : sm.payout_ratio < 0.6
                        ? 'Sustainable'
                        : sm.payout_ratio <= 1.0
                        ? 'Watch'
                        : 'Unsustainable'
                    }
                  />
                  <MetricRow label="52W Range" value={`${formatPrice(s.panel.low_52w)} – ${formatPrice(s.panel.high_52w)}`} />
                </div>

                {/* Growth Metrics (4th panel, only when data exists) */}
                {(s.growth.cagr_3yr != null || s.growth.revenue_growth != null) && (
                  <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border)]/50">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
                      <h4 className="text-sm font-bold">Growth</h4>
                    </div>
                    {/* cagr_* arrive as percents already (backend ×100) — no second ×100 */}
                    <MetricRow label="CAGR 3yr" value={s.growth.cagr_3yr != null ? `${s.growth.cagr_3yr.toFixed(1)}%` : '—'} />
                    <MetricRow label="CAGR 5yr" value={s.growth.cagr_5yr != null ? `${s.growth.cagr_5yr.toFixed(1)}%` : '—'} />
                    <MetricRow label="Rev Growth" value={s.growth.revenue_growth != null ? `${(s.growth.revenue_growth * 100).toFixed(1)}%` : '—'} />
                    <MetricRow label="Earn Growth" value={s.growth.earnings_growth != null ? `${(s.growth.earnings_growth * 100).toFixed(1)}%` : '—'} />
                    <MetricRow label="Earn 5yr" value={s.growth.earnings_growth_5yr != null ? `${(s.growth.earnings_growth_5yr * 100).toFixed(1)}%` : '—'} />
                  </div>
                )}
              </div>

              {/* Data vintage + FX provenance (WO-ASA-001.1 / 001.4) */}
              {(s.data_vintage?.statement_date || s.data_vintage?.period ||
                (s.currency?.financial_currency && s.currency.financial_currency !== 'USD')) && (
                <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)] px-1">
                  {(s.data_vintage?.statement_date || s.data_vintage?.period) && (
                    <>
                      Data as of {s.data_vintage?.statement_date ?? '—'} ({s.data_vintage?.period ?? 'latest statements'})
                      {s.data_vintage?.prices_as_of && <>; prices as of {s.data_vintage.prices_as_of}</>}.{' '}
                    </>
                  )}
                  {s.currency?.financial_currency && s.currency.financial_currency !== 'USD' &&
                    s.currency.fx_financial_to_usd != null && (
                    <>
                      Financials converted from {s.currency.financial_currency} to USD at{' '}
                      {s.currency.fx_financial_to_usd.toFixed(4)}
                      {s.currency.fx_financial_date && <> (FX as of {s.currency.fx_financial_date})</>}.
                    </>
                  )}
                </p>
              )}

              {/* P/E advisory — shown when valuation lacks a usable P/E (flows into PDF/print capture) */}
              {recommendation && peNum == null && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[var(--color-text-primary)]">P/E not available</span>
                    {' — '}
                    {cf.net_income != null && cf.net_income <= 0
                      ? `${s.ticker} is not profitable on a trailing-12-month basis (negative earnings)`
                      : 'this metric is unavailable from the data source'}
                    . This rating relies on cash-flow metrics (FCF yield, P/FCF, OCF/NI); interpret the valuation accordingly.
                  </span>
                </div>
              )}

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
