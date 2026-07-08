# WO-ASA-004.5 Proximity Scoring — Verdict Diff Report (sign-off gate)

**Date:** 2026-07-09 · **Status:** implemented, **shipped DARK** behind `AISA_PROXIMITY_SCORING=1` (Render env var, currently unset — production verdicts unchanged until Lindsay approves)

## What it does
Per-check near-miss gradation for Growth & Quality: within ±10% of a tier
boundary, credit ramps linearly toward the next tier instead of falling off a
cliff. The marathon fix — an OCF/NI of 0.98 vs a 1.00 gate no longer scores
identically to 0.50. Verdict bands (BUY ≥ 4.5, HOLD ≥ 3.0) unchanged. Graham
gradation is deferred to MVQ Phase 1 (its checks are binary by design and get
the full continuous treatment there).

## Regression diff — same fetched data, scored both ways (Jul 9)

| Ticker | Before (score → verdict) | After (score → verdict) | Verdict changed? |
|---|---|---|---|
| NVS | 5.00 → BUY | 5.00 → BUY | no |
| AMGN | 4.00 → HOLD | 4.00 → HOLD | no |
| NVO | 2.50 → SELL | 2.90 → SELL | no |
| MRK | 4.00 → HOLD | 4.00 → HOLD | no |
| BMY | 5.00 → BUY | 5.00 → BUY | no |
| AMZN | 3.60 → HOLD | 3.60 → HOLD | no |
| CRM | 5.00 → BUY | 5.00 → BUY | no |
| GOOGL | 3.50 → HOLD | 3.50 → HOLD | no |
| VRTX | 3.50 → HOLD | 4.30 → HOLD | no (WO acceptance case: OCF/NI 0.98 near-miss earns partial credit; FCF yield 42% below threshold earns none) |
| XOM | 2.00 → SELL | 2.80 → SELL | no |
| DINO | 4.00 → HOLD | 4.00 → HOLD | no |
| EQT | 4.50 → BUY | 4.50 → BUY | no |

**Zero verdict changes on the July 8 regression set.** Scores move only for
stocks with genuine near-misses, always by less than one band width. A future
stock sitting exactly at a band edge (e.g., 4.4 with a near-miss) could tip
to the next verdict — that is the intended behavior of the fix.

**One boundary semantics note:** FCF yield exactly 5.00% and P/FCF exactly
20.0x now earn full credit (previously the strict `>`/`<` comparisons gave
half). No stock in the regression set sits on either boundary.

## To activate after sign-off
Render → `ai-stock-render-api` → Environment → add `AISA_PROXIMITY_SCORING=1`
→ Save. To revert: remove the variable. No code change either way.

*Sign-off: Lindsay approves activation? ☐ yes ☐ hold*
