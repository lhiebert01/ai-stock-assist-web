import { motion } from 'motion/react';
import { Brain, TrendingUp, Minus, TrendingDown, AlertTriangle, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIRecommendation, Methodology } from '../types/stock';
import { frameworkLabel } from '../lib/formatters';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  methodology: Methodology;
}

export default function RecommendationCard({ recommendation, methodology }: RecommendationCardProps) {
  const { rating, text, has_recommendation } = recommendation;

  const ratingConfig = {
    BUY: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'BUY',
    },
    HOLD: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-400',
      icon: <Minus className="w-6 h-6" />,
      label: 'HOLD',
    },
    SELL: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-400',
      icon: <TrendingDown className="w-6 h-6" />,
      label: 'SELL',
    },
    // Neutral gray — a data-quality state, deliberately NOT a verdict color
    // (WO-ASA-001.3: missing/corrupt data must never look like a SELL).
    NOT_RATED: {
      bg: 'bg-zinc-500/10 border-zinc-500/30',
      text: 'text-zinc-400',
      icon: <HelpCircle className="w-6 h-6" />,
      label: 'NOT RATED',
    },
    ERROR: {
      bg: 'bg-zinc-500/10 border-zinc-500/30',
      text: 'text-zinc-400',
      icon: <AlertTriangle className="w-6 h-6" />,
      label: 'N/A',
    },
  };

  const config = ratingConfig[rating] || ratingConfig.ERROR;

  // Extract key factor — first bullet or first sentence from text
  let keyFactor = '';
  if (has_recommendation && text) {
    const bulletMatch = text.match(/[-*•]\s*\*\*(.+?)\*\*/);
    if (bulletMatch) {
      keyFactor = bulletMatch[1].replace(/:$/, '');
    } else {
      const sentenceMatch = text.match(/^(?:#.*\n+)?(.+?\.)/);
      if (sentenceMatch) keyFactor = sentenceMatch[1].slice(0, 80);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl overflow-hidden ${config.bg}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${config.text}`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4
              className="text-sm font-bold"
              title="AI Stock Assist evaluates this stock using the methodology shown — independent from the Wall Street analyst consensus shown in the header. The two views may differ."
            >
              AI Stock Assist Verdict — <span className={config.text}>{frameworkLabel(methodology)}</span>
            </h4>
            {keyFactor && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-[300px] truncate">{keyFactor}</p>
            )}
          </div>
        </div>

        {has_recommendation && (
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 shadow-lg shadow-current/5 ${config.text}`}>
            {config.icon}
            <span className="text-2xl font-extrabold tracking-tight">{config.label}</span>
          </div>
        )}
      </div>

      {/* Body — Markdown rendering */}
      <div className="px-6 py-5 text-sm leading-relaxed text-[var(--color-text-secondary)] prose prose-invert prose-sm max-w-none
        prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold prose-headings:text-base
        prose-strong:text-[var(--color-text-primary)]
        prose-ul:my-2 prose-li:my-0.5
        prose-p:my-2
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>

      {/* What would change this verdict — deterministic triggers computed from
          the published thresholds (never by the LLM). HOLD/SELL only. */}
      {recommendation.watch_conditions && recommendation.watch_conditions.length > 0 && (
        <div className="px-6 pb-5">
          <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 p-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              What would change this verdict
            </h5>
            <div className="space-y-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {recommendation.watch_conditions.map((c, i) => (
                <p key={i} className={i === 0 ? 'font-medium text-[var(--color-text-primary)]' : ''}>{c}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer — shown directly beneath every BUY/HOLD/SELL verdict */}
      <div className="px-6 pb-4">
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          AI-generated analysis for educational purposes — not financial advice and not a prediction.
        </p>
      </div>
    </motion.div>
  );
}
