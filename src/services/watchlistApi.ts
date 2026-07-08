/**
 * Watchlist service (Phase II feature, spec in ai-stock-render
 * docs/PROJECT_PLAN_PHASE_II.md). Thin wrapper over the `watchlists` table
 * (see supabase/migrations/2026-07-08-watchlists.sql — RLS restricts rows to
 * the owner).
 *
 * Graceful degradation: if the table doesn't exist yet (migration not run),
 * every call reports `unavailable: true` and the UI hides watchlist features
 * instead of erroring — deploying this code ahead of the migration is safe.
 */
import { supabase } from '../supabase';
import type { WatchlistEntry } from '../types/stock';

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  // PostgREST: PGRST205 = table not in schema cache; 42P01 = undefined table
  return error.code === 'PGRST205' || error.code === '42P01' ||
    /relation .* does not exist|Could not find the table/i.test(error.message || '');
}

export async function listWatchlist(): Promise<{ entries: WatchlistEntry[]; unavailable?: boolean }> {
  const { data, error } = await supabase
    .from('watchlists')
    .select('id, ticker, note, last_price, last_rating, added_at')
    .order('added_at', { ascending: false });
  if (error) {
    if (isMissingTable(error)) return { entries: [], unavailable: true };
    console.error('[Watchlist] load failed:', error.message);
    return { entries: [] };
  }
  return { entries: (data as WatchlistEntry[]) || [] };
}

export async function addToWatchlist(
  userId: string,
  ticker: string,
  lastPrice: number | null = null,
  lastRating: string | null = null
): Promise<{ ok: boolean; unavailable?: boolean }> {
  const { error } = await supabase.from('watchlists').upsert(
    {
      user_id: userId,
      ticker: ticker.toUpperCase(),
      last_price: lastPrice,
      last_rating: lastRating,
    },
    { onConflict: 'user_id,ticker' }
  );
  if (error) {
    if (isMissingTable(error)) return { ok: false, unavailable: true };
    console.error('[Watchlist] add failed:', error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function removeFromWatchlist(ticker: string): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('watchlists').delete().eq('ticker', ticker.toUpperCase());
  if (error) {
    console.error('[Watchlist] remove failed:', error.message);
    return { ok: false };
  }
  return { ok: true };
}
