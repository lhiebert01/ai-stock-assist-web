# Design Brief — Modern Value & Quality (MVQ) Framework
**Product:** AI Stock Assist · **Date:** 2026-07-08 · **Owner:** Lindsay Hiebert · **Executor:** Fable (Claude Code)
**Status:** DESIGN + VALIDATION PROTOCOL — not a build order until the backtest gate passes
**Working name:** "Modern Value & Quality (MVQ)" — final naming is Lindsay's call (canon decision)
**Relationship to existing WOs:** 004.6 (sector cohorts, cost-of-capital hurdles) is the first installment of this framework; WO-ASA-003 sealed-core rule governs it; 002.17 claims register constrains all language.

---

## 0. POSITION STATEMENT (claims-register compliant)

- We do NOT claim the framework predicts returns. Verdicts are framework outputs; "the card does the arithmetic; you make the decision."
- We do NOT claim superiority by assertion. "Better than Graham" is a testable hypothesis with pre-registered criteria (Section 4). Until validated: language is "modernized," "evidence-tested," "principles retained, measurements updated."
- Graham remains available as a clearly labeled historical lens ("Graham Classic — 1949 criteria, unmodified"). Users can compare. Deprecating it entirely is a later product decision, informed by the backtest.
- Honest limit to publish: any published signal decays as markets adapt. Graham's rules stopped working partly BECAUSE they worked. Ours will face the same force. We commit to re-validation on a schedule (annual), not a one-time blessing.

## 1. WHAT SURVIVES FROM GRAHAM (principles, not measurements)

| Graham principle | Antique measurement | MVQ measurement (research basis) |
|---|---|---|
| Margin of safety | P/E × P/B ≤ 22.5; price ≤ 2/3 NCAV | FCF yield vs (10Y UST + equity risk premium spread); EV/EBIT vs sector cohort |
| Earnings power | 10-yr positive earnings; static P/E cap | ROIC vs estimated WACC; gross profitability (GP/Assets, Novy-Marx); margin stability over 12 quarters |
| Financial strength | Current ratio ≥ 2.0; book-value anchoring | Net debt / EBITDA (cohort-adjusted); interest coverage; Piotroski F-score elements |
| Earnings reality | (not addressed — Graham trusted reported EPS) | OCF/NI accrual check (already shipped); capex/FCF bridge (002.9); receivables-vs-revenue divergence (Season 2 feature) |
| Prudent temperament | Dividend record required | Shareholder yield = dividends + net buybacks (buybacks were tax-disadvantaged in Graham's era; today they are half of capital return) |
| (absent in Graham) | — | Momentum 12-1 as an OVERLAY only — modulates confidence, never the fundamental score (sealed-core rule) |

## 2. THE MVQ SCORE

**Five pillars, continuous scoring (extends 004.5 proximity scoring from bands to native design):**
1. **Valuation** — FCF yield spread over 10Y+ERP; EV/EBIT percentile within sector cohort.
2. **Profitability & Quality** — ROIC−WACC spread; GP/Assets; margin trend.
3. **Financial Strength** — net debt/EBITDA vs cohort tolerance; interest coverage; F-score liquidity/leverage deltas.
4. **Earnings Reality** — OCF/NI; capex/FCF bridge; accrual ratio. (Integrity-adjacent but still a SCORING pillar; the integrity gates remain separate and untouchable.)
5. **Growth Durability** — revenue growth persistence; reinvestment rate; earnings-growth stability (not magnitude — persistence).

**Mechanics**
- Each check: continuous 0–1 (full credit at/beyond threshold, linear inside near-miss band, zero beyond) — 004.5 machinery reused.
- Pillar = mean of its checks (only verified checks count; RATED_WITH_CAVEATS states from 004.2 apply unchanged).
- Composite = weighted pillar sum. **Initial weights: equal (0.2 each).** Weights may be recalibrated ONLY by the validation protocol, never hand-tuned to make a favored stock pass — log every weight change with the backtest run that justified it.
- Verdict bands map from composite exactly like today (BUY / HOLD / SELL + confidence), so the UX, QA gates, export machinery, and claims all carry over.
- Sector/capital-intensity cohorts (004.6) adjust thresholds for pillars 1 and 3. Cohort disclosed on card.

**Sealed core (WO-ASA-003 rule, restated because it is the whole ballgame):**
The score is deterministic and reproducible: same inputs → same score, every time. The LLM writes narrative FROM the computed score and bound facts (004.4 binding). The LLM never scores, never fills a missing metric, never adjusts a verdict. "AI-powered" in this product means AI-explained; the arithmetic is code.

## 3. TRANSPARENCY (answering the direct question: YES)

- Full methodology published un-gated in the Metrics Guide: every check, threshold, band, weight, cohort table, and the verdict math. A user with a spreadsheet must be able to reproduce any card's score.
- Per-card: verification trace (002.16) + "scored on N of M verified checks" (004.2) + near-miss notes (004.5) + cohort disclosure (004.6).
- Methodology version stamped on every card and report (MVQ v1.0.x); changes get a public changelog entry.

## 4. VALIDATION PROTOCOL (the gold-study discipline — this is what Graham never did)

**Pre-registration (write BEFORE running anything; publish the pre-registration):**
- H1: MVQ BUY-band cohort outperforms MVQ SELL-band cohort in forward 12-month total return (decile/band spread > 0, statistically distinguishable).
- H2: MVQ band spread ≥ Graham Classic band spread on the identical universe and periods.
- H3: MVQ verdicts are more stable (lower quarter-over-quarter flip rate on unchanged fundamentals) than Graham Classic.
- Success criteria, sample window, universe, and rebalance rules fixed in the pre-registration doc. If results miss, we publish the miss — exactly like goldflow-study. That publication is a trust asset either way.

**Design requirements**
1. **Point-in-time fundamentals or disclosed bias.** This is the landmine: backtesting on today's (restated) financial data is look-ahead bias and silently fakes success. Options: (a) license a PIT dataset (Sharadar/Compustat-style — cost it out first), (b) build forward-only from now: log every MVQ score in production and evaluate against realized forward returns (slower — 12+ months to first read — but free and unimpeachable), (c) run (b) as primary with a disclosed-bias historical study as directional context only. Recommend (c).
2. Survivorship-bias-free universe (include delisted names) for any historical arm; disclose if unavailable.
3. Walk-forward evaluation; no weight tuning on the evaluation window (train/validate split if weights are calibrated at all).
4. Three arms, same universe, same dates: Graham Classic · current Growth & Quality · MVQ.
5. Metrics: band-spread forward returns, rank information coefficient, hit rate, max drawdown of BUY cohort, verdict flip rate.
6. Publication: Substack/Medium evidence-first piece in the goldflow-study format (methods → data → results → limits), regardless of outcome. Claims register reviews all language.

**Gate:** MVQ ships to users as a default framework ONLY after the validation write-up exists. It may ship earlier as a clearly labeled "MVQ (beta — validation in progress)" third toggle, with the forward-only production logging (option b) running from day one.

## 5. BUILD SEQUENCE (after WO-ASA-004 P0 ships)

1. **Phase 1 — Foundations already ordered:** 004.5 proximity scoring + 004.6 cohorts/cost-of-capital hurdles + 002.9 capex/FCF bridge. (~this IS MVQ pillars 1, 3, 4 in embryo.)
2. **Phase 2 — Pillar completion:** ROIC/WACC estimation, GP/Assets, shareholder yield, persistence metrics; momentum overlay wired through WO-ASA-003 overlay architecture (confidence-only).
3. **Phase 3 — Pre-registration doc + forward logging on** (every production score archived with as-of stamp — this data is an asset from day one).
4. **Phase 4 — Backtest arms + publication.**
5. **Phase 5 — Naming, Metrics Guide chapter, toggle placement, and the Graham Classic re-label.** Season 2 content hook: an episode where Frank and Maya watch the framework itself get tested ("even the referee gets refereed") — show-your-work applied to us.

## 6. OPEN DECISIONS FOR LINDSAY
1. Framework name (canon).
2. PIT data budget: license vs forward-only vs hybrid (Section 4 recommends hybrid c).
3. Ship "MVQ beta" toggle before validation completes, or hold entirely?
4. Momentum overlay: include at all? (Research-supported but drifts toward trading-tool territory — check against "complement not compete" positioning and the two-games Season 2 framing.)
5. Graham Classic: keep as historical lens or retire post-validation?
