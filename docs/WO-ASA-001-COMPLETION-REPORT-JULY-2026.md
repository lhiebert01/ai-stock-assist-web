# WO-ASA-001 Completion Report — AI Stock Assist, July 8 2026

**For:** Lindsay Hiebert / Claude Fable advisor review
**Scope executed:** WO-ASA-001 P0 (all items) + report-QA gate + fixtures, plus Tier-1 revenue protection and Tier-2 engagement features from the same-day product scan. Everything below is **deployed to production and verified live**.
**Repos/commits:** `ai-stock-render` 04fffaa, 0e0a129, e752112, c98e5fa · `ai-stock-assist-web` e070387, e6a37d7, 559539d

---

## 1. The headline: before vs. after on the exact tickers that triggered the work order

Same 8 tickers as the defective July 8 report (`NVS, AMGN, NVO, MRK, BMY, AMZN, CRM, GOOGL`), re-run through the deployed engine the same day:

| | BEFORE (defective report) | AFTER (live engine, Jul 8) |
|---|---|---|
| **NVO revenue** | "$309.06B" (DKK rendered as $) | **$50.0B USD** (converted at a dated DKK→USD rate) |
| **NVO net income** | "$102.43B" | **$18.6B USD** |
| **NVO FCF yield** | 13.20% (mixed-currency artifact) | **2.15%** (internally consistent) |
| **NVO cross-check** | MCap/NI implied P/E ≈ 2.1x vs displayed 11.90x — contradiction unnoticed | MCap/NI = 11.8 vs P/E 11.93 — **passes** |
| **NVO verdict** | **BUY — TOP PICK of the report** | **SELL** (score on clean data) |
| **Report Top Pick** | NVO (built on corrupt inputs) | **CRM** (10.6% FCF yield, P/E 19.6 — real numbers) |
| **GOOGL vintage** | Margin 37.9% × revenue implied ~$153B NI, card showed $132B, P/E implied ~$160B — three periods on one card | Margin 37.9% × revenue $422.5B = **$160.2B = displayed NI exactly**; MCap/NI 28.0 ≈ P/E 27.93; one TTM vintage, stamped on the card |
| **"AWS" input** | Full stock card, N/A everywhere, stamped **SELL** | Intercepted at input: "AWS isn't a listed ticker — … Analyze AMZN instead?" — no card, no credit |
| **Data vintage** | Undeclared, mixed | Every card: "Data as of 2026-03-31 (TTM); prices as of 2026-07-08" |
| **Integrity status** | No such concept | All 8 cards: **OK** — and a card that fails is NOT_RATED, never BUY/HOLD/SELL |

Notably, NVO is the **only** verdict that changed — every stock with honest data kept its rating. The gates fixed corruption without disturbing anything that was right.

> ⚠️ **Expected behavior note:** the defective July 8 analysis still exists in Analysis History. Re-exporting *that saved entry* to Word will now be **blocked by the report QA gate (HTTP 422)** — by design. The old numbers fail the cross-consistency checks, and the gate's job is to stop exactly that report from being published again. Run the tickers fresh to get an exportable clean report.

---

## 2. Work-order scorecard — every item, honest status

### P0 — Data-integrity gates (ALL SHIPPED ✅)

| WO item | Status | What shipped |
|---|---|---|
| 001.1 Currency normalization + cross-consistency validator | ✅ SHIPPED | FX provenance on every snapshot (`currency` block with rate + date), USD normalization of statement AND trading-side values, fail-closed on missing FX. Validator recomputes P/E vs MCap/NI, FCF yield, P/FCF, margin, OCF≥FCF, OCF−capex=FCF from displayed absolutes; breach → `DATA_INCONSISTENT`. FX footnote renders on card + Word export. Live-verified: NVO (DKK), NVS, TM (JPY), AAPL control. |
| 001.2 Ticker validation + segment aliasing | ✅ SHIPPED | Alias map (AWS→AMZN, YouTube/Waymo→GOOGL, Azure→MSFT, Instagram/WhatsApp/Facebook→META, Google→GOOGL) enforced in the UI (confirmation before any credit) AND server-side; malformed symbols rejected; post-fetch plausibility gate — no card ever renders for an unresolved symbol. |
| 001.3 NOT_RATED state | ✅ SHIPPED | `NOT_RATED` with sub-reasons (INSUFFICIENT_DATA / DATA_INCONSISTENT / UNRESOLVED_SYMBOL). <5 of 6 G&Q inputs (or <6 of 8 Graham) or failed integrity → NOT_RATED. Structurally excluded from Top Pick, Stocks-to-Avoid, rankings, Executive-Summary highlights, and denominator language. Neutral gray card, deterministic text (no LLM). *Note: WO acceptance said 1 missing metric → NOT_RATED while the requirement recommended N=5 of 6; implemented N=5. Missing FCF still → NOT_RATED (kills 2 inputs).* |
| 001.4 Single data vintage | ✅ SHIPPED | One statement vintage per card (TTM-first, FY fallback — never mixed); profit margin recomputed from the same vintage; visible "Data as of" stamp on cards and exports. |
| §5 Report QA gate | ✅ SHIPPED | Runs before Word export; blocks (422 with reasons) on unresolved symbols, cross-consistency breaches, or NOT_RATED names in ranked sections; truncated Bottom Lines dropped rather than published. |
| §6 Fixtures | ✅ 4 of 6 | Fixtures 1 (DKK-corrupt), 2 (AWS), 3 (missing FCF), 5 (mixed vintage) green in CI — 18 tests total. Fixtures 4 & 6 test P1/P3 features and are explicit skips until those ship. |

### Shipped beyond the P0 scope (same day)

- **001.7 Bottom Line truncation (was P1):** completeness validator (terminal punctuation + all tickers present) with one regeneration and a never-publish-truncated rule; token budget doubled. ✅
- **001.12 Watch-condition triggers (was P2):** "What would change this verdict" on every HOLD/SELL card — deterministic, price-solved ("FCF yield reaches 5% — price ≤ $X at current FCF"). ✅
- **Server-side revenue protection (from the product scan, not the WO):** real Supabase JWT verification + credit check/charge inside `/api/analyze` (the credit system was previously browser-only and fully bypassable). 402 on empty balance; charges only delivered snapshots. ✅ **ACTIVE in production** (`/health` → `auth_verified: true, credit_enforcement: true`).
- **Engagement features:** Watchlists (bookmark → Watchlist page → re-analyze selected), "Re-analyze at today's prices" on saved reports, low-credit nudges, Discovery selection persistence + credit-labeled analyze, History delete + honest load errors.
- **Reliability:** history saves verified (a silent-failure class that once hid a bug for 5 days), Bottom Line persisted with each analysis and restored in saved views/exports.
- **Accuracy bonus:** CAGR displayed 100× too high in the app and Word exports (backend already returns percent) — fixed both.
- **Access fix:** Metrics Guide un-gated (was locked to users with credits remaining; deep link failed for visitors).
- **Ops/cost:** Render account had THREE billed services from this repo (blueprint name-drift). Consolidated to one (`ai-stock-render-api` = api.aistockassist.com), duplicates suspended, blueprint disconnected, `render.yaml` removed, topology documented in `RENDER-DEPLOY.md`. **~$14/month saved.**

### Infrastructure activation (all confirmed)

- Supabase: `watchlists` table + RLS, `analysis_history.plain_summary` column (migration in `supabase/migrations/2026-07-08-watchlists-and-history.sql`) ✅
- Render env: `SUPABASE_JWT_SECRET` (JWT verify) + `SUPABASE_SERVICE_ROLE_KEY` (credit enforcement) ✅
- `/health` self-reports `version`, `auth_verified`, `credit_enforcement` for deploy verification ✅

---

## 3. What is NOT done yet (the honest list — this is the roadmap)

### P1 — Framework hardening (next sprint; touches files changed today)
1. **001.5 Leverage-distorted ROE flag + ROIC** — *still live in the current report:* AMGN shows ROE 101.3% beside D/E 623.75 and the narrative can still praise it unqualified. Needs the ⚠ leverage annotation, ROIC in Fundamentals, and negative-equity handling. (WO fixture 4 activates with this.)
2. **001.6 Debt/Equity unit convention** — still rendered as 623.75-style percents; standardize to ratio (6.24x) product-wide + threshold logic + Metrics Guide.
3. **001.8 Investor-type picks ⊆ BUY set** — a HOLD can still appear under "Growth investor"; generalize the income-investor "none at current ratings" pattern. Blank metrics need reason codes ("— (n/m: loss year)").
4. **Metrics Guide copy updates** (D/E convention, hurdle policy, overlay stance) — part of the WO's definition of done, rides with the above.

### P2 — Analytical depth
5. **001.9 Capex/FCF bridge** — now vividly needed: AMZN's TTM FCF is currently *negative* (≈ −$2.5B; capex exceeds OCF), which the framework reads as terrible value with no visibility into the AI-capex cycle behind it.
6. **001.10 Adaptive FCF-yield hurdle** — single config constant + peer-relative percentile.
7. **001.11 SOTP module** — sourced, haircut, scenario-only panel.
8. **001.12 remainder** — alert *subscriptions* on the now-shipped triggers (email "GOOGL crossed your BUY-zone price"); first recurring-revenue candidate.

### P3 — Context overlays (sealed-core architecture)
9. L1 exposure tags / L2 macro regime snapshot / L3 technicals (RSI etc.), all provenance-stamped. **Non-negotiable design rule stands: overlays modulate confidence, narrative, and flags — never the deterministic score.** (WO fixture 6 activates here.)

### Growth & operations backlog
10. Owned email list (forms currently just redirect to Substack), premium-tier definition (packs list identical features), money-back-guarantee claim needs a real flow or removal, admin analytics + role-based admin (hardcoded email today), legacy Streamlit/Stripe dead-code removal from the backend repo.

### Immediate niceties
11. **Owner smoke test** (30 seconds): sign in → analyze one ticker (proves JWT + server billing end-to-end) → type `AWS` (alias prompt) → bookmark a card (Watchlist).
12. Re-run the 8-ticker report in the app to produce the clean "after" document for the archive.

---

## 4. Verification record

- 18 automated tests green (fixtures reproduce each production defect and confirm each is blocked).
- Live regression: NVO/NVS/TM/AAPL currency + vintage + verdicts; all 8 report tickers re-run post-deploy — every card integrity-OK, TTM-stamped, and only the corrupted stock's verdict changed.
- Deploys verified by served content, not badges: `/health` version stamp (backend), bundle feature-string grep (frontend).

*Prepared July 8, 2026 by Claude (Fable 5) with owner-in-the-loop activation. Questions for the advisor: prioritization of P1 vs. the alert-subscription revenue feature, and whether the P3 overlay architecture should be its own work order (recommended: WO-ASA-003, keeping WO-ASA-002 for P1/P2).*
