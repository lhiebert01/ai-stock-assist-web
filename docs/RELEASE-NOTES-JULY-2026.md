# Release Notes — July 2026

Frontend: `ai-stock-assist-web` (Vercel) · Backend: `ai-stock-render` (Render)

## 🎯 Headline: verdicts are now deterministic (the "same ticker, different rating" fix)

**The problem.** The same ticker could get **BUY, HOLD, or SELL depending on which other stocks it was analyzed with** — and could even flip on an *identical* re-run. Evidence from one day's logs: EQT was BUY with HPK but HOLD with FIS; WDC ran the full SELL→HOLD→BUY range across batches; and `NOW/MSFT/CRM/INTU`, re-run three times unchanged, returned MSFT = HOLD, SELL, HOLD and NOW = SELL, HOLD, HOLD. A recommendation engine that isn't reproducible isn't trustworthy — this was the single biggest credibility risk in the product.

**Root cause (two compounding failures):**
1. **Peer contamination.** Each per-stock recommendation was fed the *comparative analysis* and told to be "CONSISTENT with the comparative analysis conclusion." The comparison is **relative** (it must name a Top Pick), so a stock's standalone rating was anchored to how it ranked *within that batch*. Change the peers → change the verdict.
2. **The LLM decided the rating.** The Growth & Quality path had **no numeric scoring** — Gemini chose BUY/HOLD/SELL from prose. Even at temperature 0.2 that's non-deterministic, which is why identical batches produced different verdicts.

**The fix — compute the decision in code; let the LLM only narrate it** (same guardrail pattern as the Bottom Line's superlatives):
- **New deterministic engine** `api/lib/verdict.py` → `compute_verdict(snapshot, methodology)`. The BUY/HOLD/SELL is computed from the ticker's **own** metrics against the **fixed thresholds already published in the Metrics Guide** → a score (Growth & Quality = X/6; Graham = X/8) → fixed cutoffs. Same input → same output, byte-for-byte, forever, **independent of the batch.**
  - *Growth & Quality (6 criteria, 0/0.5/1.0 each):* FCF Yield >5%, P/FCF <20, OCF/NI ≥1.0, ROE >15%, Profit Margin >10%, Balance-Sheet Health ≥70. BUY ≥4.5 · HOLD ≥3.0 · SELL <3.0. **Guardrails:** OCF/NI <0.5 forces SELL (earnings not cash-backed); extreme overvaluation (low FCF yield + very high/negative P/FCF) can't be a value BUY.
  - *Graham Value (8 criteria counted in code):* size, current ratio ≥2, positive earnings, dividend, earnings growth, P/E <15, P/B <1.5, Graham Number <22.5. BUY ≥6 · HOLD ≥4 · SELL <4. No positive earnings → cannot be a clean BUY.
  - Confidence is also rules-based: HIGH when decisive & complete, MEDIUM at a cutoff (one criterion-flip away) or with a missing metric, LOW when data is sparse. Missing metrics are never a free pass (extends the existing P/E-N/A handling).
- **The LLM now writes only the narrative** (Key Strengths / Key Risks / Bottom Line) given the *decided* verdict + the per-criterion pass/fail. It cannot change the rating.
- **Decoupled from peers.** The per-stock recommendation no longer receives the comparative context (`generate_investment_recommendation` ignores `comparative_context`; the frontend stops passing it).
- **The comparison ranks, never re-rates.** It uses the locked per-stock verdicts; "Top Pick" = the highest-scoring stock in the batch. A standalone-SELL stays SELL even if it's the best of a weak group (framed as "best of a weak set").

**Result:** a ticker's rating is now a pure function of its own fundamentals. EQT reads the same in every batch; MSFT reads the same on every re-run. Every verdict is explainable ("BUY — 5/6 Growth & Quality criteria: FCF Yield 8.2%, OCF/NI 1.6x…"), which is far stronger than "the AI said so."

**Regression test:** `api/tests/test_verdict_consistency.py` (no network) asserts determinism (25 identical runs), peer-independence, threshold behavior, the OCF/NI guardrail, missing-data confidence capping, and the Graham no-earnings rule. Run: `python3 api/tests/test_verdict_consistency.py`.

## ✨ New feature: "The Bottom Line — in Plain English"
A readable narrative summary now leads multi-stock reports (web card + PDF + Word) — the voice of one investor who did the cash-flow homework, ranked by value with honest caveats — distinct from the structured metric tables below. Backend `generate_plain_english_summary()` with a **superlative guardrail**: every "best/highest/cheapest" is pre-computed in code (`_ranking_facts`) and handed to the model as locked facts, so the summary can't misstate a ranking (it had once claimed "INTU has the best ROE" when MSFT's is higher). Self-hides for a single stock or when AI is unavailable.

## Correctness fixes
- **Free cash flow could exceed operating cash flow (impossible).** `get_cash_flow_metrics` read `info["freeCashflow"]` and `info["operatingCashflow"]` as two independent Yahoo estimates that don't reconcile — for CRM it returned FCF $16.55B > OCF $15.22B, inflating FCF Yield (13.2% vs real 11.5%) and compressing P/FCF (7.6x vs 8.7x); MSFT was also wrong (1.3%/75x vs real 2.6%/39x). Fix: compute FCF/OCF/capex from the **cash-flow statement** (`tkr.cashflow`), derive FCF = OCF − |capex| when needed, fall back to `info` only if the statement is missing, and add a hard guard that FCF can never exceed OCF. See [[lesson_yfinance_fcf_info_unreliable]].

## Lessons learned
- **Never let an LLM decide anything that must be reproducible or comparable.** Ratings, superlatives, rankings, and any published number belong in deterministic code; the model narrates. (Two instances this cycle: the verdict engine and the Bottom Line superlatives.)
- **Relative context must never leak into an absolute judgment.** A per-item verdict fed "here's how it ranks vs the group" will drift with the group. Keep standalone judgments standalone; do ranking separately, downstream, and let it re-order but never re-rate.
- **`yfinance` `.info` fields are unreliable estimates** — pull from the financial statements and add invariant guards (FCF ≤ OCF, dividend-yield sanity, drop trailing-NaN closes). See [[lesson_yfinance_fcf_info_unreliable]], [[lesson_yfinance_trailing_nan_row]], [[lesson_yfinance_dividend_yield_percent]].
- **The bug was found in the wild, then reproduced from the user's own logs before any code changed** — verify first, fix at the source, and add a regression test so it can't silently return.

## Planned follow-ups (backlog — owner will QA history first)
1. **Make the type-check a real deploy gate.** `vite build` doesn't type-check, and `npm run lint` (`tsc --noEmit`) already has pre-existing errors (`import.meta.env` typing in Auth.tsx/stockApi.ts/supabase.ts; Supabase admin generics in `api/admin/users.ts`). Fix those so `tsc` runs clean, then wire it into CI/pre-push — this would have caught the `compContext` ReferenceError before deploy. See [[lesson_vite_build_no_typecheck]].
2. **Make the Analysis-History `try/catch` loud.** It currently swallows a failed save as a `console.warn` (which hid the 5-day breakage). Upgrade to `console.error` and surface a small non-blocking toast / telemetry event so a broken write is visible immediately.

