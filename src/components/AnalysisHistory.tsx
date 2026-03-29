import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Loader2, Search, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '../supabase';
import type { AppUser } from '../types/user';

interface AnalysisHistoryProps {
  user: AppUser;
}

interface HistoryEntry {
  id: string;
  tickers: string[];
  methodology: string;
  created_at: string;
}

export default function AnalysisHistory({ user }: AnalysisHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('analysis_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setEntries(data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

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
          Your past stock analyses
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
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--color-accent)]/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <div>
                  <div className="font-bold font-mono text-sm">{Array.isArray(entry.tickers) ? entry.tickers.join(', ') : entry.tickers}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {entry.methodology} — {Array.isArray(entry.tickers) ? entry.tickers.length : 1} stock{(Array.isArray(entry.tickers) ? entry.tickers.length : 1) > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
