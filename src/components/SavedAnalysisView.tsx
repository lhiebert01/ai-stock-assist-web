import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Info } from 'lucide-react';
import type { FullHistoryEntry, Methodology } from '../types/stock';
import ExecutiveSummary from './ExecutiveSummary';
import StockCard from './StockCard';
import ComparisonTable from './ComparisonTable';
import ReportActions from './ReportActions';

interface SavedAnalysisViewProps {
  entry: FullHistoryEntry;
  onBack: () => void;
}

export default function SavedAnalysisView({ entry, onBack }: SavedAnalysisViewProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const methodology = entry.methodology as Methodology;
  const snapshots = entry.snapshots || [];
  const recommendations = entry.recommendation || {};
  const comparativeAnalysis = entry.comparative_analysis || null;

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
      </motion.div>

      {/* Report actions */}
      <ReportActions
        snapshots={snapshots}
        methodology={methodology}
        comparativeAnalysis={comparativeAnalysis}
        resultsRef={resultsRef}
      />

      {/* Results content — captured for PDF export */}
      <div ref={resultsRef}>
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
