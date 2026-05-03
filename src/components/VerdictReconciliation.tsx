import { Scale, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { Methodology } from '../types/stock';
import {
  normalizeRating,
  compareVerdicts,
  getReconciliation,
  bucketLabel,
  type Bucket,
} from '../lib/ratingNormalize';

interface VerdictReconciliationProps {
  analystRaw: string | null | undefined;
  aiRating: 'BUY' | 'HOLD' | 'SELL' | 'ERROR' | undefined;
  methodology: Methodology;
}

function bucketColor(b: Bucket): string {
  if (b === 'BUY') return 'text-emerald-400';
  if (b === 'SELL') return 'text-red-400';
  if (b === 'HOLD') return 'text-yellow-400';
  return 'text-[var(--color-text-muted)]';
}

export default function VerdictReconciliation({
  analystRaw,
  aiRating,
  methodology,
}: VerdictReconciliationProps) {
  const analyst = normalizeRating(analystRaw);
  const ai: Bucket =
    aiRating === 'BUY' || aiRating === 'HOLD' || aiRating === 'SELL' ? aiRating : 'UNKNOWN';

  const verdict = compareVerdicts(analyst, ai);

  if (verdict === 'unknown') return null;

  if (verdict === 'agreement') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[var(--color-text-secondary)]">
          Both <strong className="text-[var(--color-text-primary)]">Wall Street</strong> and{' '}
          <strong className="text-[var(--color-text-primary)]">AI Stock Assist ({methodology})</strong>{' '}
          agree:{' '}
          <strong className={bucketColor(ai)}>{bucketLabel(ai)}</strong>.
        </span>
      </div>
    );
  }

  const copy = getReconciliation(methodology, verdict);
  if (!copy) return null;

  const isStrong = verdict === 'strong_conflict';
  const containerCls = isStrong
    ? 'bg-amber-500/5 border-amber-500/30'
    : 'bg-[var(--color-surface-1)] border-[var(--color-border)]';
  const iconCls = isStrong ? 'text-amber-400' : 'text-[var(--color-accent)]';
  const Icon = isStrong ? AlertTriangle : Scale;
  const headline = isStrong ? 'Two views — strong disagreement' : 'Two views, one stock';

  return (
    <div className={`border rounded-xl overflow-hidden ${containerCls}`}>
      <div className="flex items-start gap-3 px-4 py-3 border-b border-inherit">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconCls}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">{headline}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="text-xs flex items-center gap-2">
              <span className="text-[var(--color-text-muted)]">Wall Street consensus:</span>
              <span className={`font-bold ${bucketColor(analyst)}`}>{bucketLabel(analyst)}</span>
            </div>
            <div className="text-xs flex items-center gap-2">
              <span className="text-[var(--color-text-muted)]">AI Stock Assist ({methodology}):</span>
              <span className={`font-bold ${bucketColor(ai)}`}>{bucketLabel(ai)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        <div>
          <div className="text-[var(--color-text-primary)] font-semibold mb-1">Why they differ</div>
          <p>{copy.whyDiffer}</p>
        </div>
        <div className="flex items-start gap-2 pt-2 border-t border-[var(--color-border)]/50">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-text-muted)]" />
          <p>
            <span className="text-[var(--color-text-primary)] font-semibold">Which lens fits you? </span>
            {copy.guidance}
          </p>
        </div>
      </div>
    </div>
  );
}
