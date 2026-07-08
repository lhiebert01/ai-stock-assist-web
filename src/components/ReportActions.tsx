import { useState } from 'react';
import { FileDown, FileText, Printer, Loader2 } from 'lucide-react';
import type { StockSnapshot, Methodology } from '../types/stock';
import { exportWord } from '../services/stockApi';
import { exportPdf } from '../services/pdfExportService';

interface ReportActionsProps {
  snapshots: StockSnapshot[];
  methodology: Methodology;
  comparativeAnalysis: string | null;
  plainSummary?: string | null;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  /** When set, a QA-gate export block (422) offers a one-click fresh re-run. */
  onReanalyze?: (tickers: string) => void;
}

export default function ReportActions({ snapshots, methodology, comparativeAnalysis, plainSummary, resultsRef, onReanalyze }: ReportActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportBlocked, setExportBlocked] = useState(false);

  const tickers = snapshots.map((s) => s.ticker);
  const windowLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePdf = async () => {
    if (!resultsRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await exportPdf(resultsRef.current, methodology, tickers);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWord = async () => {
    if (wordLoading) return;
    setWordLoading(true);
    setExportError(null);
    try {
      const blob = await exportWord(snapshots, windowLabel, comparativeAnalysis || undefined, plainSummary || undefined, methodology);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Stock-Analysis-${tickers.join('-')}-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Word export failed:', err);
      // 422 = the report QA gate refused to publish (WO-ASA-002.8): explain
      // in plain language and offer a fresh re-run instead of a raw error.
      if ((err as { status?: number })?.status === 422) {
        setExportBlocked(true);
        setExportError(
          'This report can\'t be exported as a document — its saved data no longer passes our ' +
          'data-integrity checks (this typically affects analyses saved before the checks existed, ' +
          'or runs made during a data-source outage). Re-run these tickers at today\'s prices for a ' +
          'clean, exportable report. PDF and Print still capture the page as-is.'
        );
      } else {
        setExportError((err as Error)?.message || 'Export failed. Please try again.');
      }
    } finally {
      setWordLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print flex items-center justify-center gap-2 mb-6 flex-wrap">
      <button
        onClick={handlePdf}
        disabled={pdfLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all disabled:opacity-50"
      >
        {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        Download PDF
      </button>
      <button
        onClick={handleWord}
        disabled={wordLoading}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all disabled:opacity-50"
      >
        {wordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        Download Word
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>
      {exportError && (
        <div className="w-full text-center mt-1">
          <p className={`text-xs ${exportBlocked ? 'text-amber-300' : 'text-red-400'} max-w-2xl mx-auto`}>{exportError}</p>
          {exportBlocked && onReanalyze && (
            <button
              onClick={() => onReanalyze(tickers.join(' '))}
              className="mt-2 px-4 py-2 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-bold hover:bg-[var(--color-accent)]/25 transition-all"
            >
              Re-run {tickers.join(', ')} at today's prices ({tickers.length} credit{tickers.length > 1 ? 's' : ''})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
