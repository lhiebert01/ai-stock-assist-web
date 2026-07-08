# WO-ASA-006 — Single Metrics Dictionary + Sidebar Guide Update
**Product:** AI Stock Assist · **Date:** 2026-07-09 · **Owner:** Lindsay Hiebert · **Executor:** Fable (Claude Code)
**Root cause class:** canon drift — two live surfaces (report sidebar Metrics Guide vs Learn-page full guide) render different tiers, formulas, and checklist thresholds for the same metrics. Same failure class the Academy REFERENCE-DICTIONARY solved: facts must live in ONE bound source, not be re-typed per surface.
**Priority:** P1 (user-facing trust surface; brand claim is "you can check our math" — the two surfaces currently disagree on the math). Slot after burn-in, alongside/before 005.1 Compare Mode (compare mode adds a third surface consuming the same definitions — build the dictionary first so compare mode never re-types a threshold).

---

## 006.1 — METRICS-DICTIONARY (single source of truth) — P1
**Requirements**
1. One versioned dictionary file (YAML or TS, mirroring the SanctumShield/Academy pattern) defining, per metric: id, display name, formula (ONE canonical formula), plain-English one-liner, tier bands (values + labels + colors), pro tip, framework bindings (which framework checks consume it, with the check threshold), and per-surface render hints (sidebar = compact, guide = full).
2. Both surfaces (sidebar + Learn guide) render FROM the dictionary. No metric name, formula, tier, or threshold hardcoded in either page. Compare mode (005.1) and card tooltips consume the same source when they ship.
3. CI check: grep/AST test fails any PR that introduces a numeric threshold or metric formula outside the dictionary file. (Same mechanism as the claims-register CI.)
4. Dictionary carries a version stamp; guide + sidebar footer show it ("Definitions v1.x").

## 006.2 — RECONCILE THE DRIFTED VALUES (Lindsay decision table) — P1, blocks 006.1 data entry
The dictionary forces one answer per metric. Current conflicts to resolve (recommendation in bold — generally the FULL GUIDE wins because it was the reviewed WO-ASA-002.7 copy, with two exceptions):
| Metric | Sidebar | Full guide | **Recommend** |
|---|---|---|---|
| P/FCF tiers | <15/15–25/>25 | <15/15–25/>35 | **Guide tiers**, plus the existing "framework scores at <20x" note |
| P/B tiers | >3.0 expensive | 1.5–5.0 fair, >10 very exp. | **Guide** |
| D/E tiers | >1.0 risky | >2.0 high risk | **Guide** (sector-cohort note lands with 004.6) |
| Current Ratio | <1.5 weak | <1.0 risky | **Guide** |
| Quick Ratio formula | (Cash+Receivables)/CL | (CA−Inventory)/CL | **Guide formula** (broader/standard); one formula everywhere |
| Checklist D/E | <0.5 quality / >2.0 flag | <1.0 must-have / >3.0 critical | **Guide** |
| Dividend yield red tier | "0% or unsustainable" | >8% possibly unsustainable | **Guide** (">8% — possible yield trap"); 0% is a style, not a flag |
| Sidebar missing metrics | — | Payout Ratio present | **Add Payout Ratio to sidebar** (it's the "is the dividend safe" check — earns its slot) |
NOTE: unit convention (D/E as ratio vs %) remains 002.5's job; dictionary stores the canonical ratio form and 002.5 converts display.

## 006.3 — SIDEBAR RESTRUCTURE (frameworks first, compact) — P1
Keep the sidebar a QUICK REFERENCE — lens-aware, not lens-lengthy.
1. **New header block, "Two Lenses" (~8 lines total):**
   > **Growth & Quality** — six checks on cash, earnings honesty, profitability, balance sheet. 0–6 score: **BUY ≥ 4.5 · HOLD ≥ 3.0 · below = SELL**.
   > **Graham Classic** — Benjamin Graham's 1949 criteria, unmodified. A strict historical lens; useful sparring partner for any modern verdict.
   > Every metric below tags which checks it feeds. Full methodology → [How Verdicts Are Scored]
2. **Framework chips per section** (from guide Section D, adapted): each sidebar section footer gets its chip — e.g. Cash Flow: "⚡ Framework checks: FCF yield ≥ 5% and OCF/NI ≥ 1.0 — two of the six points live here." Metrics that feed a check get a small badge (G&Q ✓ / Graham ✓ / context-only).
3. **Add two "Reading the Card" micro-entries** (2 lines each): "Data as of" (one card, one clock) and "n/m" (when a ratio would lie, we say so). These now appear on every report; the sidebar must define them.
4. Screening checklist: render from dictionary (kills its independent thresholds); add the one canonical line "OCF/NI below 1.0 means stop and ask why."
5. When MVQ beta ships (🟡): header block gains the MVQ three-liner from the staged addendum — dictionary-driven, no copy fork.

## ACCEPTANCE CRITERIA
- Diff test: render sidebar + guide from dictionary → zero threshold/formula mismatches (automated comparison, run in CI).
- All 8 reconciliation rows resolved per Lindsay's sign-off on 006.2 table; changed sidebar values verified live.
- CI hardcoded-threshold check demonstrably fails a seeded violation PR.
- Sidebar header renders in ≤ one phone screen before first metric section (compactness gate).
- Guide + sidebar footers show matching "Definitions v1.0".
- Claims check: new copy passes register grep (no superlatives; Graham framing = "historical lens / sparring partner").

## DEFINITION OF DONE
Dictionary live and consumed by both surfaces; drift structurally impossible (CI-enforced); 006.2 decisions logged in the dictionary file header as canon; completion report with before/after screenshots of sidebar header + one reconciled metric on both surfaces.
