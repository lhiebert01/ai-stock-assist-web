import ReactMarkdown from 'react-markdown';
import { Sparkles } from 'lucide-react';

interface BottomLineProps {
  summary: string | null;
}

/**
 * "The Bottom Line — in Plain English": a readable, narrative summary of the
 * comparison (the voice of one investor who did the cash-flow homework),
 * shown above the metric tables so a skimmer gets the real story first.
 */
export default function BottomLine({ summary }: BottomLineProps) {
  if (!summary || summary.trim().length === 0) return null;
  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30 rounded-2xl px-6 py-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
        <h3 className="font-bold text-[var(--color-text-primary)]">
          The Bottom Line{' '}
          <span className="font-normal text-[var(--color-text-secondary)]">— in Plain English</span>
        </h3>
      </div>
      <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed comparative-analysis">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
