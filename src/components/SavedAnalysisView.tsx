import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Info, RefreshCw } from 'lucide-react';
import type { FullHistoryEntry, Methodology } from '../types/stock';
import ExecutiveSummary from './ExecutiveSummary';
import StockCard from './StockCard';
import ComparisonTable from './ComparisonTable';
import ReportActions from './ReportActions';
import BottomLine from './BottomLine';

interface SavedAnalysisViewProps {
  entry: FullHistoryEntry;
  onBack: () => void;
  /** Re-run these tickers at today's prices (spends credits). */
  onReanalyze?: (tickers: string) => void;
}

export default function SavedAnalysisView({ entry, onBack, onReanalyze }: SavedAnalysisViewProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const methodology = entry.methodology as Methodology;
  const snapshots = entry.snapshots || [];
  const recommendations = entry.recommendation || {};
  const comparativeAnalysis = entry.comparative_analysis || null;
  const tickers = Array.isArray(entry.tickers) ? entry.tickers : [entry.tickers];

  const dateStr = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="no-print flex items-center gap-2 mb-6 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </button>

      {/* Date banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-3 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm"
      >
        <Info className="w-4 h-4 shrink-0" />
        <span>
          Saved analysis from <strong>{dateStr}</strong> — prices and data reflect that point in time.
        </span>
        {onReanalyze && (
          <button
            onClick={() => onReanalyze(tickers.join(' '))}
            className="no-print ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/25 transition-all"
            title={`Run a fresh analysis of ${tickers.join(', ')} (uses ${tickers.length} credit${tickers.length > 1 ? 's' : ''})`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-analyze at today's prices
          </button>
        )}
      </motion.div>

      {/* Report actions */}
      <ReportActions
        snapshots={snapshots}
        methodology={methodology}
        comparativeAnalysis={comparativeAnalysis}
        plainSummary={entry.plain_summary}
        resultsRef={resultsRef}
      />

      {/* Results content — captured for PDF export */}
      <div ref={resultsRef}>
        {/* Bottom Line (saved with the report from Jul 2026 on; self-hides when absent) */}
        <BottomLine summary={entry.plain_summary ?? null} />

        {/* Executive Summary */}
        <ExecutiveSummary
          snapshots={snapshots}
          recommendations={recommendations}
          methodology={methodology}
          comparativeAnalysis={comparativeAnalysis}
        />

        {/* Comparison Table */}
        {snapshots.length >= 2 && (
          <ComparisonTable
            snapshots={snapshots}
            comparativeAnalysis={comparativeAnalysis}
            recommendations={recommendations}
            methodology={methodology}
          />
        )}

        {/* Stock Cards (no PriceChart — use hideChart prop) */}
        <div className="space-y-8">
          {snapshots.map((snap, i) => (
            <motion.div
              key={snap.ticker}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <StockCard
                snapshot={snap}
                recommendation={recommendations[snap.ticker]}
                methodology={methodology}
                hideChart
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
