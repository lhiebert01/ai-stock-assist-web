import { useMemo } from 'react';
import {
  Trophy, Table2, Search, AlertTriangle, Users, FileText, Brain,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIRecommendation, Methodology, StockSnapshot } from '../types/stock';

interface AnalysisCardsProps {
  analysis: string;
  snapshots: StockSnapshot[];
  recommendations?: Record<string, AIRecommendation>;
  methodology: Methodology;
}

interface ParsedAnalysis {
  topPick: { ticker: string | null; body: string } | null;
  sections: { heading: string; body: string }[];
}

function parseAnalysis(md: string): ParsedAnalysis {
  const result: ParsedAnalysis = { topPick: null, sections: [] };

  const topPickMatch = md.match(/^##\s+Top Pick:?\s*(\S+)?\s*\n([\s\S]*?)(?=\n##\s|\n###\s|$)/m);
  let remainder = md;
  if (topPickMatch) {
    const ticker = topPickMatch[1]?.replace(/[^A-Z0-9.]/gi, '').toUpperCase() || null;
    result.topPick = { ticker, body: topPickMatch[2].trim() };
    remainder = md.slice(0, topPickMatch.index) + md.slice(topPickMatch.index! + topPickMatch[0].length);
  }

  const parts = remainder.split(/(?=^###\s)/m).map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const headingMatch = part.match(/^###\s+(.+)$/m);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();
    const body = part.slice(headingMatch[0].length).trim();
    result.sections.push({ heading, body });
  }
  return result;
}

function sectionIcon(heading: string) {
  const h = heading.toLowerCase();
  if (h.includes('summary') || h.includes('comparison')) return { Icon: Table2, accent: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/20' };
  if (h.includes('per-stock') || h.includes('verdict') || h.includes('evaluation')) return { Icon: Search, accent: 'text-violet-400', bg: 'bg-violet-500/5 border-violet-500/20' };
  if (h.includes('avoid')) return { Icon: AlertTriangle, accent: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' };
  if (h.includes('investor') || h.includes('recommend')) return { Icon: Users, accent: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' };
  return { Icon: FileText, accent: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-surface-1)] border-[var(--color-border)]' };
}

function extractBottomLine(text: string): string | null {
  if (!text) return null;
  const m = text.match(/BOTTOM LINE:?\s*\**\s*([^\n]+)/i);
  if (m) return m[1].replace(/^\**|\**$/g, '').trim();
  return null;
}

function ratingPillClass(rating: string): string {
  if (rating === 'BUY') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (rating === 'SELL') return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (rating === 'HOLD') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
}

export default function AnalysisCards({ analysis, snapshots, recommendations, methodology }: AnalysisCardsProps) {
  const parsed = useMemo(() => parseAnalysis(analysis), [analysis]);

  const independentVerdicts = useMemo(() => {
    if (!recommendations) return [];
    return snapshots
      .map((s) => ({
        ticker: s.ticker,
        name: s.name,
        rec: recommendations[s.ticker],
      }))
      .filter((v) => v.rec && v.rec.has_recommendation);
  }, [snapshots, recommendations]);

  const topPickTicker = parsed.topPick?.ticker;

  return (
    <div className="space-y-4">
      {/* HERO — Top Pick */}
      {parsed.topPick && (
        <div className="relative bg-gradient-to-br from-emerald-500/10 via-[var(--color-surface-2)] to-[var(--color-surface-1)] border border-emerald-500/30 rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-[var(--color-accent)] to-emerald-500" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Our Top Pick</div>
                <div className="flex items-center gap-2">
                  {topPickTicker && (
                    <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{topPickTicker}</span>
                  )}
                  <span className="text-xs text-[var(--color-text-muted)]">· {methodology}</span>
                </div>
              </div>
            </div>
            <div
              className="comparative-analysis text-[var(--color-text-secondary)] prose prose-invert max-w-none
                prose-p:my-1.5 prose-strong:text-[var(--color-text-primary)]"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.topPick.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Independent Per-Stock Verdicts (from existing AI recs, not LLM-redone) */}
      {independentVerdicts.length > 0 && (
        <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border)]">
            <Brain className="w-4 h-4 text-[var(--color-accent)]" />
            <h4 className="text-sm font-bold">AI Stock Assist — Per-Stock Verdict (independent of Wall Street)</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {independentVerdicts.map(({ ticker, name, rec }) => {
              const bottom = extractBottomLine(rec.text);
              return (
                <div key={ticker} className="bg-[var(--color-surface-2)] border border-[var(--color-border)]/60 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <div className="font-bold text-sm">{ticker}</div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate">{name}</div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold border ${ratingPillClass(rec.rating)}`}>
                      {rec.rating === 'ERROR' ? 'N/A' : rec.rating}
                    </span>
                  </div>
                  {bottom && (
                    <p className="text-xs text-[var(--color-text-secondary)] leading-snug mt-1">{bottom}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed analysis sections — each in its own card */}
      {parsed.sections.length > 0 ? (
        parsed.sections.map((section, i) => {
          const { Icon, accent, bg } = sectionIcon(section.heading);
          return (
            <div key={i} className={`border rounded-xl overflow-hidden ${bg}`}>
              <div className="flex items-center gap-2 px-5 py-3 border-b border-inherit">
                <Icon className={`w-4 h-4 ${accent}`} />
                <h4 className="text-sm font-bold">{section.heading}</h4>
              </div>
              <div className="px-5 py-4">
                <div
                  className="comparative-analysis text-[var(--color-text-secondary)] prose prose-invert max-w-none
                    prose-p:my-2 prose-p:leading-relaxed
                    prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                    prose-h4:text-sm prose-h4:text-[var(--color-text-primary)]
                    prose-strong:text-[var(--color-text-primary)]
                    prose-ul:my-2 prose-li:my-1 prose-li:marker:text-[var(--color-text-muted)]"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        // Fallback: render the entire analysis as-is if section parsing produced nothing
        !parsed.topPick && (
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl px-5 py-4">
            <div
              className="comparative-analysis text-[var(--color-text-secondary)] prose prose-invert max-w-none
                prose-headings:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)]"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
            </div>
          </div>
        )
      )}
    </div>
  );
}
