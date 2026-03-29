import { motion } from 'motion/react';
import { Brain, TrendingUp, Minus, TrendingDown, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIRecommendation, Methodology } from '../types/stock';

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
    ERROR: {
      bg: 'bg-zinc-500/10 border-zinc-500/30',
      text: 'text-zinc-400',
      icon: <AlertTriangle className="w-6 h-6" />,
      label: 'N/A',
    },
  };

  const config = ratingConfig[rating] || ratingConfig.ERROR;

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
            <h4 className="text-sm font-bold">AI Recommendation</h4>
            <p className="text-xs text-[var(--color-text-muted)]">{methodology}</p>
          </div>
        </div>

        {has_recommendation && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 ${config.text}`}>
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
    </motion.div>
  );
}
