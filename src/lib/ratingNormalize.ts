import type { Methodology } from '../types/stock';

export type Bucket = 'BUY' | 'HOLD' | 'SELL' | 'UNKNOWN';

const BUY_TERMS = new Set(['BUY', 'STRONG_BUY', 'STRONG BUY', 'OUTPERFORM', 'OVERWEIGHT']);
const SELL_TERMS = new Set(['SELL', 'STRONG_SELL', 'STRONG SELL', 'UNDERPERFORM', 'UNDERWEIGHT']);
const HOLD_TERMS = new Set(['HOLD', 'NEUTRAL', 'MIXED', 'MARKET_PERFORM', 'MARKETPERFORM', 'EQUAL_WEIGHT', 'EQUALWEIGHT', 'PEER_PERFORM']);

export function normalizeRating(raw: string | null | undefined): Bucket {
  if (!raw) return 'UNKNOWN';
  const r = raw.toString().trim().toUpperCase().replace(/[-\s]/g, '_');
  if (BUY_TERMS.has(r) || BUY_TERMS.has(r.replace(/_/g, ' '))) return 'BUY';
  if (SELL_TERMS.has(r) || SELL_TERMS.has(r.replace(/_/g, ' '))) return 'SELL';
  if (HOLD_TERMS.has(r) || HOLD_TERMS.has(r.replace(/_/g, ' '))) return 'HOLD';
  return 'UNKNOWN';
}

export type Verdict = 'agreement' | 'mild_conflict' | 'strong_conflict' | 'unknown';

export function compareVerdicts(analyst: Bucket, ai: Bucket): Verdict {
  if (analyst === 'UNKNOWN' || ai === 'UNKNOWN') return 'unknown';
  if (analyst === ai) return 'agreement';
  if ((analyst === 'BUY' && ai === 'SELL') || (analyst === 'SELL' && ai === 'BUY')) return 'strong_conflict';
  return 'mild_conflict';
}

interface Reconciliation {
  whyDiffer: string;
  guidance: string;
}

const GUIDANCE_TRADER = 'If you trade on momentum or 6–12 month price targets, the analyst view is closer to your horizon.';
const GUIDANCE_VALUE = 'If you invest for the long term and prioritize valuation discipline and cash flow quality, our methodology is closer to your horizon.';

const COPY: Record<Methodology, Record<Verdict, Reconciliation | null>> = {
  'Graham Value Investing': {
    agreement: null,
    mild_conflict: {
      whyDiffer:
        "Wall Street targets weight near-term earnings momentum and analyst consensus. Graham's framework emphasizes margin of safety, conservative valuation, and balance sheet strength — so a stock can be a tactical hold for traders while still failing Graham's criteria for a conviction buy.",
      guidance: `${GUIDANCE_TRADER} ${GUIDANCE_VALUE}`,
    },
    strong_conflict: {
      whyDiffer:
        "Wall Street targets reflect 12-month price expectations driven by earnings momentum and sector flows. Graham's framework rejects a stock outright when valuation overshoots intrinsic value (high P/E, weak margin of safety, low FCF yield) — regardless of how much further price might run. Both can be 'right' on different time horizons.",
      guidance: `${GUIDANCE_TRADER} ${GUIDANCE_VALUE}`,
    },
    unknown: null,
  },
  'Growth & Quality': {
    agreement: null,
    mild_conflict: {
      whyDiffer:
        'Wall Street targets weight earnings momentum and consensus revisions. Our Growth & Quality framework also penalizes weak cash flow conversion (OCF/NI), thin margins, and stretched valuations — so a stock with strong revenue growth can still earn a more cautious rating from us.',
      guidance: `${GUIDANCE_TRADER} ${GUIDANCE_VALUE}`,
    },
    strong_conflict: {
      whyDiffer:
        'Wall Street targets are driven by price momentum and consensus earnings forecasts. Our Growth & Quality framework demands sustainable growth backed by real cash flow, healthy margins, and a defensible valuation — and downgrades stocks where the price has run far ahead of the underlying business quality, even if growth headlines look strong.',
      guidance: `${GUIDANCE_TRADER} ${GUIDANCE_VALUE}`,
    },
    unknown: null,
  },
};

export function getReconciliation(methodology: Methodology, verdict: Verdict): Reconciliation | null {
  return COPY[methodology]?.[verdict] ?? null;
}

export function bucketLabel(b: Bucket): string {
  if (b === 'UNKNOWN') return '—';
  return b;
}
