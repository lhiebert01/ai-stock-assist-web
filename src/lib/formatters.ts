/** Format number as human-readable money: $1.5B, $230M, etc. */
export function humanMoney(x: number | null | undefined, digits = 2): string {
  if (x == null || !isFinite(x)) return '—';
  const abs = Math.abs(x);
  if (abs >= 1_000_000_000_000) return `$${(x / 1_000_000_000_000).toFixed(digits)}T`;
  if (abs >= 1_000_000_000) return `$${(x / 1_000_000_000).toFixed(digits)}B`;
  if (abs >= 1_000_000) return `$${(x / 1_000_000).toFixed(digits)}M`;
  return `$${x.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** Format percentage: +5.23% */
export function pctFmt(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return '—';
  return `${x >= 0 ? '+' : ''}${x.toFixed(2)}%`;
}

/** Trend arrow: ↑ ↗ → ↘ ↓ */
export function trendArrow(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return '→';
  if (x > 5) return '↑';
  if (x > 1) return '↗';
  if (x > -1) return '→';
  if (x > -5) return '↘';
  return '↓';
}

/** Color class for positive/negative values */
export function changeColor(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return 'text-[var(--color-text-muted)]';
  if (x > 0) return 'text-[var(--color-buy)]';
  if (x < 0) return 'text-[var(--color-sell)]';
  return 'text-[var(--color-text-muted)]';
}

/** Rating badge color */
export function ratingColor(rating: string): string {
  const r = rating.toUpperCase();
  if (r === 'BUY' || r === 'STRONG_BUY' || r === 'STRONG BUY') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (r === 'SELL' || r === 'STRONG_SELL' || r === 'STRONG SELL') return 'bg-red-500/15 text-red-400 border-red-500/30';
  return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
}

/** Format large numbers with commas */
export function formatNumber(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return '—';
  return x.toLocaleString();
}

/** Format price: $123.45 */
export function formatPrice(x: number | null | undefined): string {
  if (x == null || !isFinite(x)) return '—';
  return `$${x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
