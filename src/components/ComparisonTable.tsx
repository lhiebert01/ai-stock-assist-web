import { useState } from 'react';
import { motion } from 'motion/react';
import { Table2, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { StockSnapshot } from '../types/stock';
import { formatPrice, humanMoney, pctFmt, changeColor, ratingColor } from '../lib/formatters';

interface ComparisonTableProps {
  snapshots: StockSnapshot[];
  comparativeAnalysis: string | null;
}

export default function ComparisonTable({ snapshots, comparativeAnalysis }: ComparisonTableProps) {
  const [showAnalysis, setShowAnalysis] = useState(true);

  return (
    <div className="mb-8 space-y-4">
      {/* Comparison Grid */}
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--color-border)]">
          <Table2 className="w-5 h-5 text-[var(--color-accent)]" />
          <h3 className="font-bold">Stock Comparison</h3>
          <span className="text-sm text-[var(--color-text-muted)]">({snapshots.length} stocks)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">Ticker</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">Price</th>
                <th className="text-center px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">Rating</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">Daily</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">YTD</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider">1Y</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider hidden lg:table-cell">P/E</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider hidden lg:table-cell">FCF Yield</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => {
                const rating = s.analyst.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—';
                return (
                  <tr key={s.ticker} className="border-b border-[var(--color-border)]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold">{s.ticker}</div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate max-w-[120px]">{s.name}</div>
                    </td>
                    <td className="text-right px-4 py-3 font-mono font-medium">{formatPrice(s.price)}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${ratingColor(rating)}`}>
                        {rating}
                      </span>
                    </td>
                    <td className={`text-right px-4 py-3 font-mono ${changeColor(s.changes.daily_pct)}`}>
                      {pctFmt(s.changes.daily_pct)}
                    </td>
                    <td className={`text-right px-4 py-3 font-mono ${changeColor(s.changes.ytd_pct)}`}>
                      {pctFmt(s.changes.ytd_pct)}
                    </td>
                    <td className={`text-right px-4 py-3 font-mono ${changeColor(s.changes.y1_pct)}`}>
                      {pctFmt(s.changes.y1_pct)}
                    </td>
                    <td className="text-right px-4 py-3 font-mono hidden lg:table-cell">
                      {s.trailing_pe != null ? `${s.trailing_pe.toFixed(1)}x` : '—'}
                    </td>
                    <td className="text-right px-4 py-3 font-mono hidden lg:table-cell">
                      {s.cash_flow.fcf_yield != null ? `${s.cash_flow.fcf_yield.toFixed(2)}%` : '—'}
                    </td>
                    <td className="text-right px-4 py-3 hidden md:table-cell">
                      {humanMoney(s.market_cap)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Comparative Analysis */}
      {comparativeAnalysis && (
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-accent)]/20 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="font-bold">AI Comparative Analysis</h3>
            </div>
            {showAnalysis ? <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />}
          </button>

          {showAnalysis && (
            <div className="px-6 pb-6 text-sm leading-relaxed text-[var(--color-text-secondary)] prose prose-invert prose-sm max-w-none
              prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold
              prose-strong:text-[var(--color-text-primary)]
              prose-table:border-collapse prose-th:border prose-th:border-[var(--color-border)] prose-th:px-3 prose-th:py-2 prose-th:bg-[var(--color-surface-3)]
              prose-td:border prose-td:border-[var(--color-border)] prose-td:px-3 prose-td:py-2
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{comparativeAnalysis}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
