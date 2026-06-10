import { useState } from 'react';
import { FileDown, FileText, Printer, Loader2 } from 'lucide-react';
import type { StockSnapshot, Methodology } from '../types/stock';
import { exportWord } from '../services/stockApi';
import { exportPdf } from '../services/pdfExportService';

interface ReportActionsProps {
  snapshots: StockSnapshot[];
  methodology: Methodology;
  comparativeAnalysis: string | null;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReportActions({ snapshots, methodology, comparativeAnalysis, resultsRef }: ReportActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

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
    </div>
  );
}
