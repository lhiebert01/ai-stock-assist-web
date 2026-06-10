import { useState } from 'react';
import { FileDown, FileText, Printer, Loader2 } from 'lucide-react';
import type { StockSnapshot, Methodology } from '../types/stock';
import { exportWord } from '../services/stockApi';

interface ReportActionsProps {
  snapshots: StockSnapshot[];
  methodology: Methodology;
  comparativeAnalysis: string | null;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReportActions({ snapshots, methodology, comparativeAnalysis, resultsRef }: ReportActionsProps) {
  const [wordLoading, setWordLoading] = useState(false);

  const tickers = snapshots.map((s) => s.ticker);
  const windowLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePdf = () => {
    // Native browser print → "Save as PDF" / "Microsoft Print to PDF". Renders the
    // REAL page — the lightweight-charts canvas and sharp vector text — exactly as
    // shown, via the @media print theme. html2canvas could not capture this app's
    // dark CSS-variable theme AND the chart canvas together (black-on-black text or
    // blank graphs), so we use the browser's own engine instead.
    window.print();
  };

  const handleWord = async () => {
    if (wordLoading) return;
    setWordLoading(true);
    try {
      const blob = await exportWord(snapshots, windowLabel, comparativeAnalysis || undefined);
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
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all"
      >
        <FileDown className="w-4 h-4" />
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
    </div>
  );
}
