import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Loader2, Trash2, BarChart3, Check, Plus } from 'lucide-react';
import type { WatchlistEntry } from '../types/stock';
import { listWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistApi';
import { formatPrice, ratingColor } from '../lib/formatters';
import { SEGMENT_ALIASES } from '../lib/symbols';

interface WatchlistPageProps {
  /** The signed-in user (rows are per-user). */
  userId: string;
  /** Hand selected tickers to the analyzer (spends credits there). */
  onAnalyze: (tickers: string) => void;
}

export default function WatchlistPage({ userId, onAnalyze }: WatchlistPageProps) {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addInput, setAddInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addNote, setAddNote] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await listWatchlist();
      setEntries(result.entries);
      setUnavailable(!!result.unavailable);
      setLoading(false);
    })();
  }, []);

  // Add tickers directly (comma/space delimited) — no analysis, no credits.
  const handleAdd = async () => {
    if (adding) return;
    const raw = addInput.toUpperCase().split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);
    if (raw.length === 0) return;
    const isLikelyTicker = (t: string) => /^[A-Z][A-Z0-9.\-]{0,9}$/.test(t);
    const notes: string[] = [];
    // Segment names map to their parent automatically (AWS -> AMZN)
    const resolved = raw.map((t) => {
      const alias = SEGMENT_ALIASES[t];
      if (alias) {
        notes.push(`${t} isn't a listed ticker — added its parent ${alias.ticker} instead.`);
        return alias.ticker;
      }
      return t;
    });
    const invalid = resolved.filter((t) => !isLikelyTicker(t));
    if (invalid.length > 0) notes.push(`Skipped (not valid ticker symbols): ${invalid.join(', ')}.`);
    const valid = [...new Set(resolved.filter(isLikelyTicker))];

    setAdding(true);
    let addedCount = 0;
    for (const t of valid) {
      const { ok } = await addToWatchlist(userId, t);
      if (ok) addedCount++;
    }
    if (addedCount > 0) {
      const result = await listWatchlist();
      setEntries(result.entries);
      setAddInput('');
    }
    setAddNote(notes.length > 0 ? notes.join(' ') : (addedCount > 0 ? null : 'Nothing was added.'));
    setAdding(false);
  };

  const toggle = (ticker: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else if (next.size < 10) next.add(ticker);
      return next;
    });
  };

  const remove = async (ticker: string) => {
    const { ok } = await removeFromWatchlist(ticker);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.ticker !== ticker));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(ticker);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Watchlist</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Stocks you're tracking — select any and re-analyze them at today's prices
        </p>
      </div>

      {unavailable && (
        <div className="text-center py-16 text-sm text-[var(--color-text-muted)]">
          Watchlists are being rolled out — check back shortly.
        </div>
      )}

      {/* Direct add — no analysis, no credits; just tracks the tickers */}
      {!unavailable && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Add tickers to your list — e.g. AAPL, MSFT, NVDA"
              className="flex-1 px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all outline-none"
              disabled={adding}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !addInput.trim()}
              className="flex items-center gap-1.5 px-5 py-3 bg-amber-500/15 text-amber-400 border border-amber-500/40 rounded-xl text-sm font-bold hover:bg-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add to Watchlist
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 px-1">
            Adding to your watchlist is free — analysis credits are only used when you click "Analyze at today's prices."
          </p>
          {addNote && <p className="text-xs text-amber-400 mt-1 px-1">{addNote}</p>}
        </div>
      )}

      {!unavailable && entries.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-bold mb-2">Nothing saved yet</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Add tickers above, or use the "Save to Watchlist" button on any analyzed stock card
          </p>
        </div>
      )}

      {!unavailable && entries.length > 0 && (
        <>
          {selected.size > 0 && (
            <div className="sticky top-20 z-40 mb-4">
              <div className="bg-[var(--color-surface-1)] border border-[var(--color-accent)]/30 rounded-xl p-3 flex items-center justify-between backdrop-blur-xl">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {selected.size} selected
                </span>
                <button
                  onClick={() => onAnalyze(Array.from(selected).join(' '))}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)] rounded-lg font-bold hover:brightness-110 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analyze at today's prices ({selected.size} credit{selected.size > 1 ? 's' : ''})
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {entries.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggle(e.ticker)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  selected.has(e.ticker)
                    ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/30'
                    : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-accent)]/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected.has(e.ticker)
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                      : 'border-[var(--color-border-light)]'
                  }`}
                >
                  {selected.has(e.ticker) && <Check className="w-3 h-3 text-[var(--color-surface-0)]" />}
                </div>
                <div className="font-bold font-mono">{e.ticker}</div>
                {e.last_rating && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${ratingColor(e.last_rating)}`}>
                    {e.last_rating.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="text-xs text-[var(--color-text-muted)] ml-auto hidden sm:inline">
                  {e.last_price != null && <>was {formatPrice(e.last_price)} · </>}
                  added {new Date(e.added_at).toLocaleDateString()}
                </span>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    remove(e.ticker);
                  }}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title={`Remove ${e.ticker} from watchlist`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
