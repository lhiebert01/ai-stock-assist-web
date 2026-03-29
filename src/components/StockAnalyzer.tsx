import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, BarChart3, BookOpen, Sparkles, X, AlertCircle } from 'lucide-react';
import type { StockSnapshot, AIRecommendation, Methodology } from '../types/stock';
import type { UserProfile } from '../types/user';
import { analyzeStocks, getRecommendation, getComparativeAnalysis } from '../services/stockApi';
import StockCard from './StockCard';
import ComparisonTable from './ComparisonTable';

interface StockAnalyzerProps {
  userProfile: UserProfile | null;
  onCreditsUsed: (count: number) => void;
  onNeedCredits: () => void;
}

export default function StockAnalyzer({ userProfile, onCreditsUsed, onNeedCredits }: StockAnalyzerProps) {
  const [input, setInput] = useState('');
  const [methodology, setMethodology] = useState<Methodology>('Growth & Quality');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [snapshots, setSnapshots] = useState<StockSnapshot[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, AIRecommendation>>({});
  const [comparativeAnalysis, setComparativeAnalysis] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const credits = userProfile?.credits_remaining ?? 0;

  const handleAnalyze = async () => {
    const tickers = input
      .toUpperCase()
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (tickers.length === 0) return;
    if (credits < tickers.length) {
      onNeedCredits();
      return;
    }

    setLoading(true);
    setErrors([]);
    setSnapshots([]);
    setRecommendations({});
    setComparativeAnalysis(null);

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

      // Step 2: Comparative analysis (if 2+ stocks)
      let compContext: string | undefined;
      if (result.snapshots.length >= 2) {
        setLoadingStep('Generating comparative analysis...');
        const comp = await getComparativeAnalysis(result.snapshots);
        setComparativeAnalysis(comp.analysis);
        compContext = comp.analysis;
      }

      // Step 3: Individual recommendations
      setLoadingStep('Generating AI recommendations...');
      const recs: Record<string, AIRecommendation> = {};
      for (const snap of result.snapshots) {
        try {
          const rec = await getRecommendation(snap, methodology, compContext);
          recs[snap.ticker] = rec;
          setRecommendations((prev) => ({ ...prev, [snap.ticker]: rec }));
        } catch {
          recs[snap.ticker] = { rating: 'ERROR', text: 'Failed to generate recommendation', has_recommendation: false };
        }
      }

      onCreditsUsed(result.snapshots.length);
    } catch (err: any) {
      setErrors([err.message || 'Analysis failed']);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleAnalyze();
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
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Analyze
          </button>
        </div>

        {/* Methodology Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Methodology:</span>
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
              Graham Value
            </button>
          </div>
        </div>
      </div>

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

      {/* Comparison Table */}
      {snapshots.length >= 2 && !loading && (
        <ComparisonTable
          snapshots={snapshots}
          comparativeAnalysis={comparativeAnalysis}
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
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
