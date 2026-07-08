import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, BarChart3, BookOpen, Sparkles, X, AlertCircle, HelpCircle } from 'lucide-react';
import { frameworkLabel, FRAMEWORK_EXPLAINERS } from '../lib/formatters';
import type { StockSnapshot, AIRecommendation, Methodology } from '../types/stock';
import type { UserProfile } from '../types/user';
import { analyzeStocks, getRecommendation, getComparativeAnalysis, validateSymbols, friendlyErrorMessage } from '../services/stockApi';
import type { SymbolFinding } from '../types/stock';
import { SEGMENT_ALIASES } from '../lib/symbols';
import { listWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistApi';
import { supabase } from '../supabase';
import StockCard from './StockCard';
import ComparisonTable from './ComparisonTable';
import BottomLine from './BottomLine';
import MetricsGlossary from './MetricsGlossary';
import ExecutiveSummary from './ExecutiveSummary';
import ReportActions from './ReportActions';

interface StockAnalyzerProps {
  userId: string;
  userProfile: UserProfile | null;
  /** serverRemaining is set when the backend enforced/charged credits itself. */
  onCreditsUsed: (count: number, serverRemaining?: number | null) => void;
  onNeedCredits: () => void;
  initialTickers?: string;
}

export default function StockAnalyzer({ userId, userProfile, onCreditsUsed, onNeedCredits, initialTickers = '' }: StockAnalyzerProps) {
  const [input, setInput] = useState(initialTickers);
  const [methodology, setMethodology] = useState<Methodology>('Growth & Quality');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, AIRecommendation>>({});
  const [comparativeAnalysis, setComparativeAnalysis] = useState<string | null>(null);
  const [plainSummary, setPlainSummary] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  // Amber, non-blocking notices (history-save trouble, low-credit nudge)
  const [notices, setNotices] = useState<string[]>([]);
  // Pre-flight findings (batch validation directive): ONE panel listing every
  // non-valid symbol with its per-item action — never fail-fast one at a time.
  const [findings, setFindings] = useState<SymbolFinding[]>([]);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [frameworkInfoOpen, setFrameworkInfoOpen] = useState(false);
  // Watchlist state — undefined until loaded; null when the table isn't live yet
  const [watched, setWatched] = useState<Set<string> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const result = await listWatchlist();
      setWatched(result.unavailable ? null : new Set(result.entries.map((e) => e.ticker)));
    })();
  }, []);

  const toggleWatch = async (ticker: string) => {
    if (watched == null) return;
    if (watched.has(ticker)) {
      const { ok } = await removeFromWatchlist(ticker);
      if (ok) setWatched((prev) => { const n = new Set(prev); n.delete(ticker); return n; });
    } else {
      const snap = snapshots.find((s) => s.ticker === ticker);
      const { ok } = await addToWatchlist(userId, ticker, snap?.price ?? null, recommendations[ticker]?.rating ?? null);
      if (ok) setWatched((prev) => new Set(prev).add(ticker));
    }
  };

  const credits = userProfile?.credits_remaining ?? 0;

  const handleAnalyze = async (tickersOverride?: string[]) => {
    const tickers = (tickersOverride ?? input
      .toUpperCase()
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean))
      .slice(0, 10);

    if (tickers.length === 0) return;

    // ── Batch pre-flight (one pass, ALL findings) ─────────────────────
    // Classifies every symbol before any analysis or credit spend:
    // VALID | ALIAS | UNKNOWN | UNVERIFIABLE. One resolution panel, one
    // press — never N resolve→re-press cycles. Skipped when called with an
    // already-resolved override list.
    if (!tickersOverride) {
      setErrors([]);
      let classified: SymbolFinding[] | null = null;
      try {
        setLoadingStep('Checking symbols...');
        setLoading(true);
        classified = (await validateSymbols(tickers)).findings;
      } catch {
        // Validation service unreachable — fall back to the local alias map
        // so segment names still get caught; unknown symbols will surface
        // with friendly copy at analysis time.
        classified = tickers.map((t) => (SEGMENT_ALIASES[t]
          ? { symbol: t, status: 'ALIAS' as const, suggested: SEGMENT_ALIASES[t].ticker, note: SEGMENT_ALIASES[t].note }
          : { symbol: t, status: 'VALID' as const }));
      }
      const issues = classified.filter((f) => f.status !== 'VALID');
      if (issues.length > 0) {
        setLoading(false);
        setLoadingStep('');
        // Default resolutions: alias → replace with parent; unknown → remove;
        // unverifiable → keep (user may know better than a stale directory)
        setFindings(issues.map((f) => ({
          ...f,
          action: f.status === 'ALIAS' ? 'replace' : f.status === 'UNKNOWN' ? 'remove' : 'keep',
        })));
        return;
      }
    }
    setFindings([]);

    if (credits < tickers.length) {
      setLoading(false);
      setLoadingStep('');
      onNeedCredits();
      return;
    }

    setLoading(true);
    setErrors([]);
    setNotices([]);
    setSnapshots([]);
    setRecommendations({});
    setComparativeAnalysis(null);
    setPlainSummary(null);

    try {
      // Step 1: Fetch snapshots
      setLoadingStep(`Analyzing ${tickers.join(', ')}...`);
      const result = await analyzeStocks(tickers, methodology);
      setSnapshots(result.snapshots);
      if (result.errors.length > 0) {
        setErrors(result.errors.map((e) => `${e.ticker}: ${e.error}`));
        if (result.snapshots.length > 0 && result.errors.length > 0) {
          setErrors(prev => [...prev, `No credits used for failed tickers. Only ${result.snapshots.length} credit${result.snapshots.length === 1 ? '' : 's'} will be deducted.`]);
        }
      }

      // If no stocks succeeded, don't deduct anything
      if (result.snapshots.length === 0) {
        setErrors(prev => [...prev, 'No credits were used since no tickers could be analyzed.']);
        return;
      }

      // Step 2: Comparative analysis + Bottom Line. At N=1 the backend returns
      // no comparative text (nothing to rank) and a single-stock-voice Bottom
      // Line instead (WO-ASA-002.19).
      let comparativeText: string | null = null; // kept ONLY for the history save
      let plainSummaryText: string | null = null;
      if (result.snapshots.length >= 1) {
        setLoadingStep(result.snapshots.length >= 2 ? 'Generating comparative analysis...' : 'Writing the Bottom Line...');
        const comp = await getComparativeAnalysis(result.snapshots, methodology);
        setComparativeAnalysis(comp.analysis || null);
        setPlainSummary(comp.plain_summary || null);
        comparativeText = comp.analysis || null; // NOT passed to per-stock recs — decouple stays intact
        plainSummaryText = comp.plain_summary || null;
      }

      // Step 3: Individual recommendations
      // NOTE: recommendations are STANDALONE — we deliberately do NOT pass the
      // comparative context, so a ticker's BUY/HOLD/SELL depends only on its own
      // fundamentals, never on which peers it was batched with.
      setLoadingStep('Generating AI recommendations...');
      const recs: Record<string, AIRecommendation> = {};
      for (const snap of result.snapshots) {
        try {
          const rec = await getRecommendation(snap, methodology);
          recs[snap.ticker] = rec;
          setRecommendations((prev) => ({ ...prev, [snap.ticker]: rec }));
        } catch {
          recs[snap.ticker] = { rating: 'ERROR', text: 'Failed to generate recommendation', has_recommendation: false };
        }
      }

      // Sync credits — server-enforced charge wins over the legacy client write
      const serverRemaining = result.credits?.enforced ? result.credits.remaining : null;
      onCreditsUsed(result.snapshots.length, serverRemaining);

      // Low-credit nudge: warn BEFORE the user hits the 0-credit wall
      const remainingNow = serverRemaining ?? Math.max(0, credits - result.snapshots.length);
      if (remainingNow <= 2) {
        setNotices((prev) => [...prev,
          remainingNow === 0
            ? 'That was your last credit — top up to keep analyzing.'
            : `Heads up: ${remainingNow} analysis credit${remainingNow === 1 ? '' : 's'} left.`,
        ]);
      }

      // Save to analysis history. Supabase returns errors rather than throwing,
      // so CHECK the result — a silent failure here once hid a broken History
      // save for 5 days. plain_summary is retried without in case the column
      // migration hasn't run yet.
      const baseRow = {
        user_id: userId,
        tickers: result.snapshots.map((s) => s.ticker),
        methodology,
        snapshots: result.snapshots,
        recommendation: recs,
        comparative_analysis: comparativeText,
      };
      let saveError: string | null = null;
      try {
        const { error } = await supabase.from('analysis_history').insert({ ...baseRow, plain_summary: plainSummaryText });
        if (error) {
          const retry = await supabase.from('analysis_history').insert(baseRow);
          saveError = retry.error ? retry.error.message : null;
        }
      } catch (histErr) {
        saveError = (histErr as Error)?.message || 'unknown error';
      }
      if (saveError) {
        console.error('[History] Failed to save:', saveError);
        setNotices((prev) => [...prev,
          'Your analysis is complete, but saving it to History failed — this report won\'t appear in your History list.',
        ]);
      }
    } catch (err) {
      // 402 = server-side credit gate — send the user to the credits page
      if ((err as { status?: number })?.status === 402) {
        setErrors([(err as Error).message.replace('INSUFFICIENT_CREDITS: ', '')]);
        onNeedCredits();
        return;
      }
      setErrors([friendlyErrorMessage(err, 'Analysis failed', tickers)]);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleAnalyze();
  };

  // Row buttons act IMMEDIATELY (owner tweak): the input text and the row
  // update on click — no second press needed for that symbol.
  const applyFinding = (symbol: string, action: 'replace' | 'remove' | 'keep') => {
    const f = findings.find((x) => x.symbol === symbol);
    const replacement = action === 'replace' && f?.suggested ? f.suggested : action === 'keep' ? symbol : null;
    setInput((prev) =>
      prev
        .split(/([\s,]+)/) // keep separators so the rest of the input is untouched
        .map((tok) => (tok.toUpperCase() === symbol ? (replacement ?? '') : tok))
        .join('')
        .replace(/[\s,]{2,}/g, ' ')
        .replace(/^[\s,]+|[\s,]+$/g, '')
    );
    setFindings((prev) => prev.filter((x) => x.symbol !== symbol));
  };

  // Apply every finding's chosen action, then run — ONE press total.
  const applyResolutionsAndAnalyze = () => {
    const original = input.toUpperCase().split(/[\s,]+/).map((t) => t.trim()).filter(Boolean).slice(0, 10);
    const bySymbol = new Map(findings.map((f) => [f.symbol, f]));
    const resolved: string[] = [];
    for (const t of original) {
      const f = bySymbol.get(t);
      if (!f) { resolved.push(t); continue; }
      if (f.action === 'replace' && f.suggested) resolved.push(f.suggested);
      else if (f.action === 'keep') resolved.push(t);
      // 'remove' → skip
    }
    const deduped = [...new Set(resolved)];
    setInput(deduped.join(' '));
    setFindings([]);
    if (deduped.length > 0) handleAnalyze(deduped);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Input Section */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Stock Analysis</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Enter up to 10 tickers separated by spaces or commas
          </p>
        </div>

        {/* Ticker Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AAPL MSFT GOOGL AMZN NVDA"
            className="w-full pl-12 pr-36 py-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-lg font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all outline-none"
            disabled={loading}
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Analyze
          </button>
        </div>

        {/* Methodology Toggle + Metrics Guide */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Analysis Framework:</span>
          <div className="flex bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg p-1">
            <button
              onClick={() => setMethodology('Growth & Quality')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                methodology === 'Growth & Quality'
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Growth & Quality
            </button>
            <button
              onClick={() => setMethodology('Graham Value Investing')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                methodology === 'Graham Value Investing'
                  ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Graham Classic
            </button>
          </div>
          {/* Framework explainer (WO-ASA-005.2): hover via title, tap via ⓘ */}
          <button
            onClick={() => setFrameworkInfoOpen((v) => !v)}
            title={FRAMEWORK_EXPLAINERS[methodology]}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
            aria-label="About this framework"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGlossaryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Metrics Guide
          </button>
        </div>

        {frameworkInfoOpen && (
          <div className="mt-3 max-w-xl mx-auto px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <span className="font-bold text-[var(--color-text-primary)]">{frameworkLabel(methodology)}: </span>
            {FRAMEWORK_EXPLAINERS[methodology]}{' '}
            <a
              href={methodology === 'Graham Value Investing' ? '/?view=metrics#choosing-a-lens' : '/?view=metrics#how-verdicts-are-scored'}
              className="text-[var(--color-accent)] font-medium hover:underline"
            >
              Full methodology →
            </a>
          </div>
        )}
      </div>

      <MetricsGlossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto text-center py-20"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" />
            <BarChart3 className="absolute inset-0 m-auto w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <p className="text-lg font-medium mb-1">{loadingStep}</p>
          <p className="text-sm text-[var(--color-text-muted)]">This may take 10-30 seconds per stock</p>
        </motion.div>
      )}

      {/* Pre-flight resolution panel — ALL findings at once, one press to
          resolve & run (batch validation directive) */}
      {findings.length > 0 && (
        <div className="max-w-3xl mx-auto mb-6 bg-[var(--color-surface-2)] border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm font-bold mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            {findings.length} symbol{findings.length > 1 ? 's need' : ' needs'} your attention — no credits were used
          </p>
          <div className="space-y-2 mb-4">
            {findings.map((f) => (
              <div key={f.symbol} className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[var(--color-surface-1)] rounded-lg text-xs">
                <span className="font-mono font-bold text-sm">{f.symbol}</span>
                <span className="text-[var(--color-text-secondary)] flex-1 min-w-[180px]">
                  {f.status === 'ALIAS' && <>{f.note} (<span className="font-mono font-bold">{f.suggested}</span>)</>}
                  {f.status === 'UNKNOWN' && <>{f.note}</>}
                  {f.status === 'UNVERIFIABLE' && <>{f.note}</>}
                </span>
                <div className="flex gap-1.5">
                  {f.status === 'ALIAS' && (
                    <button
                      onClick={() => applyFinding(f.symbol, 'replace')}
                      className="px-2.5 py-1 rounded-md font-bold bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/25 transition-all"
                    >
                      Use {f.suggested}
                    </button>
                  )}
                  {f.status === 'UNVERIFIABLE' && (
                    <button
                      onClick={() => applyFinding(f.symbol, 'keep')}
                      className="px-2.5 py-1 rounded-md font-bold bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/25 transition-all"
                    >
                      Keep anyway
                    </button>
                  )}
                  <button
                    onClick={() => applyFinding(f.symbol, 'remove')}
                    className="px-2.5 py-1 rounded-md font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => setFindings([])}
              className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              Cancel — edit the input instead
            </button>
            <button
              onClick={applyResolutionsAndAnalyze}
              className="px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)] rounded-lg text-sm font-bold hover:brightness-110 transition-all"
            >
              Resolve all & Analyze
            </button>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="max-w-3xl mx-auto mb-6">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-3 mb-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {err}
              <button onClick={() => setErrors((e) => e.filter((_, j) => j !== i))} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notices (non-blocking) */}
      {notices.length > 0 && !loading && (
        <div className="max-w-3xl mx-auto mb-6">
          {notices.map((n, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-3 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {n}
              <button onClick={() => setNotices((p) => p.filter((_, j) => j !== i))} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Report Actions */}
      {!loading && snapshots.length > 0 && (
        <ReportActions
          snapshots={snapshots}
          methodology={methodology}
          comparativeAnalysis={comparativeAnalysis}
          plainSummary={plainSummary}
          resultsRef={resultsRef}
        />
      )}

      {/* Results Section — captured for PDF */}
      <div ref={resultsRef}>
        {/* Framework banner — the lens used is stated ON the report itself,
            so screen, PDF capture, and Print all carry it */}
        {!loading && snapshots.length > 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4">
            Analyzed with: <span className="font-bold text-[var(--color-accent)]">{frameworkLabel(methodology)}</span>
            <span className="text-xs text-[var(--color-text-muted)]"> — {FRAMEWORK_EXPLAINERS[methodology]}</span>
          </p>
        )}
        {/* The Bottom Line — in Plain English (leads the results; self-hides when empty) */}
        {!loading && <BottomLine summary={plainSummary} />}

        {/* Executive Summary */}
        {!loading && snapshots.length > 0 && (
          <ExecutiveSummary
            snapshots={snapshots}
            recommendations={recommendations}
            methodology={methodology}
            comparativeAnalysis={comparativeAnalysis}
          />
        )}

        {/* Comparison Table */}
        {snapshots.length >= 2 && !loading && (
          <ComparisonTable
            snapshots={snapshots}
            comparativeAnalysis={comparativeAnalysis}
            recommendations={recommendations}
            methodology={methodology}
          />
        )}

        {/* Stock Cards */}
        {!loading && snapshots.length > 0 && (
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
                  watched={watched?.has(snap.ticker)}
                  onWatchToggle={watched != null ? () => toggleWatch(snap.ticker) : undefined}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
