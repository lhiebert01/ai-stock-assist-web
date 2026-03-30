import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Loader2, Search, Clock, BarChart3, ChevronRight, FileDown } from 'lucide-react';
import { supabase } from '../supabase';
import type { AppUser } from '../types/user';
import type { FullHistoryEntry, Methodology } from '../types/stock';
import { ratingColor } from '../lib/formatters';
import SavedAnalysisView from './SavedAnalysisView';

interface AnalysisHistoryProps {
  user: AppUser;
}

export default function AnalysisHistory({ user }: AnalysisHistoryProps) {
  const [entries, setEntries] = useState<FullHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<FullHistoryEntry | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('analysis_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setEntries((data as FullHistoryEntry[]) || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  // Show saved analysis detail view
  if (selectedEntry) {
    return (
      <SavedAnalysisView
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-0)]/80 via-transparent to-[var(--color-surface-0)]" />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Click any analysis to view full results
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-bold mb-2">No analyses yet</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Your completed analyses will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const tickers = Array.isArray(entry.tickers) ? entry.tickers : [entry.tickers];
            const recs = entry.recommendation || {};
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedEntry(entry)}
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 cursor-pointer hover:border-[var(--color-accent)]/30 hover:bg-white/[0.01] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold font-mono text-sm">{tickers.join(', ')}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {entry.methodology} — {tickers.length} stock{tickers.length > 1 ? 's' : ''}
                      </div>
                      {/* Rating pills preview */}
                      {Object.keys(recs).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tickers.map((t) => {
                            const rec = recs[t];
                            const rating = rec?.rating || 'N/A';
                            const colorClass = rec ? ratingColor(rating) : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
                            return (
                              <span
                                key={t}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}
                              >
                                {t}: {rating === 'ERROR' ? 'N/A' : rating}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
