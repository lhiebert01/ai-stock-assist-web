# AI Stock Assist — Product Hunt SUBMIT-NOW Sheet

**Last updated:** 2026-06-22 · **Status:** assets final, char-limits verified, ready to paste · Maker: Lindsay Hiebert (PI GenAI)

> Paste these blocks **in order** into Product Hunt → *Submit a product*. Every field is pre-checked against PH's character limits.
> The only thing I can't do for you is the actual click-submit (it needs your logged-in PH account).
> Full strategy + launch-day runbook lives in `PRODUCT-HUNT-SUBMISSION.md` — this sheet is just the paste-ready fields.

---

## 0. Pick the launch date (corrected weekdays — the old doc was wrong)

| Date | Weekday | Why |
|------|---------|-----|
| **Tue, July 7, 2026** ✅ recommended | Tuesday | Max traffic day **and** a full ~2-week pre-launch window from today (Jun 22) — the proper play |
| Tue, June 30, 2026 | Tuesday | Aggressive: max traffic but only ~8 days to build a Coming-Soon follower list |
| Mon, July 6, 2026 | Monday | Easier top-5 badge (lower traffic), but hugs the July 4 weekend |

**Avoid Fri July 3 – Sat July 4** (US holiday, dead audience).
Set this as a **scheduled launch** when you create the page; it goes live 12:01 AM PT on the chosen day.

---

## 1. Name
```
AI Stock Assist
```

## 2. Tagline  *(PH limit 60 chars — pick ONE)*

**Primary (brand headline, on your OG card — 52 chars):**
```
Know what you own before you buy — AI stock analysis
```
**Punchier alternates (more "maker-crowd" hook — both verified ≤60):**
```
AI stock analysis that shows its work — in 30 seconds
```
```
BUY, HOLD or SELL — with the reasoning, in 30 seconds
```
*Tip: PH's audience loves a clear "what + why it's different." The "shows its work" line tests strongest as a feed hook; the brand line is safest for visual consistency with your OG image. Either works.*

## 3. Description  *(PH limit 500 chars — RECOMMENDED, 423 chars)*
```
Most tools dump data or sell tips. AI Stock Assist tells you what you actually own. Type up to 10 tickers; in ~30s, Gemini 3.5 Flash weighs 50+ fundamentals across two frameworks (Graham Value + Growth & Quality) and returns a clear BUY/HOLD/SELL verdict — with the reasoning, the Wall Street rating beside ours, and one Top Pick. Honest about gaps: no profit? P/E shows N/A, not a fake "cheap." 3 free, no card; ~25¢ each.
```
*Alternate (feature-forward, 465 chars — also under 500):*
```
Know what you actually own before you buy. Type up to 10 tickers and in ~30s, Gemini 3.5 Flash weighs 50+ fundamentals across two disciplined frameworks (Graham Value + Growth & Quality) and returns a clear BUY/HOLD/SELL verdict — with the reasoning. See the Wall Street rating next to ours, get one defensible Top Pick, export to PDF/Word. Honest about gaps: no profit? P/E shows N/A, not a fake "cheap." 3 free analyses, no card — then ~25¢ each, no subscription.
```
*(Two-Lenses + PDF/Word export are also shown in the gallery captions and the maker first comment, so trimming them here for length is safe.)*

## 4. Link
```
https://aistockassist.com/?utm_source=producthunt&utm_campaign=launch
```

## 5. Topics  *(choose 3, most specific first)*
```
Fintech · Investing · Artificial Intelligence
```
*Alternates if those aren't offered: Finance, SaaS, Productivity*

## 6. Pricing label
```
Freemium / Free Options — 3 free analyses, then pay-per-analysis credit packs from $4.99 (~25¢ each), no subscription.
```

## 7. Shoutouts / "Built with"  *(add these on the submission form — PH links each to its own page = reciprocal visibility)*

Search each by name in PH's Shoutouts field and add it. Suggested one-liners if PH lets you add a note:

- **Vercel** — Frontend + serverless host. Our React/Vite app deploys globally in seconds and runs the Stripe checkout/webhook functions. Zero-config, instant previews.
- **Supabase** — Auth + Postgres. Powers Google sign-in, user accounts, and the saved Analysis History "casebook." Open-source, generous free tier.
- **Render** — Hosts the FastAPI engine (api.aistockassist.com) that crunches 50+ fundamentals per stock. Simple Python deploys, no DevOps.
- **Cloudflare** — DNS, CDN, and SSL in front of the domain. Fast and secure by default.
- **Stripe** — Credit-pack payments ($4.99 / $9.99). Trusted checkout, no subscription lock-in.
- **Google Gemini** (Gemini 3.5 Flash) — The reasoning engine behind every BUY/HOLD/SELL verdict — fast and sharp.
- **Groq** — Lightning-fast inference backup (Llama 3.3 70B) so analysis never stalls.
- **Claude / Claude Code** (Anthropic) — How the app was built — AI-assisted development end to end.

*Core four to prioritize (you named these): Vercel · Supabase · Render · Cloudflare. The rest are bonus credit if PH allows more shoutouts.*

## 8. Thumbnail / logo  (240×240)
**File:** `docs/images/brand/ai-stock-assist-emblem-angular.png` ✅ on disk (teal→emerald chart-line diamond, matches favicon + header)

---

## 9. Gallery  (first image = the feed thumbnail; make it strongest)

| # | File / capture | Status | Caption |
|---|----------------|--------|---------|
| 1 THUMBNAIL | `public/og-card-v4.jpg` | ✅ ready | Know what you own before you buy — AI stock analysis, powered by Gemini 3.5 Flash. |
| 2 | **screenshot:** single-stock Verdict card (BUY/HOLD/SELL + CONFIDENCE + Strengths/Risks) | ⏳ capture | A clear verdict with the reasoning — not just data tiles. |
| 3 | **screenshot:** Two-Lenses panel (Wall St vs our verdict + "Why they differ") | ⏳ capture | Two views, one stock — and which lens fits your horizon. |
| 4 | **screenshot:** multi-stock comparison + "Our Top Pick" | ⏳ capture | Compare up to 10 stocks; get one defensible Top Pick. |
| 5 | **screenshot:** stock card with price chart + 50+ metrics | ⏳ capture | 50+ fundamentals across cash flow, quality, and valuation — in seconds. |
| 6 | `public/og-image-4.jpg` | ✅ ready | Check any stock's honesty in 30 seconds — 3 free. |
| 7 (optional) | 20–40s screen recording: tickers in → verdict → Two-Lenses → Top Pick → PDF | ⏳ optional | Tickers in → verdict → Two-Lenses → Top Pick → PDF. |

**Minimum to launch today:** images 1 + 6 already exist (plus the logo) — you *can* go live with just those. The 4 product screenshots make the page much stronger; capture them from a CVE/WTI multi-stock run, crop to ~1270×760. Alternates on disk: `og-image-3/5/2.jpg`, `hero-showcase.jpg`.

---

## 10. First maker comment  (post the instant you go live, after adding yourself as Maker)
```
Hi Product Hunt 👋 I'm Lindsay, founder of PI GenAI and an "AI for Good" product line.

I built AI Stock Assist because most tools either dump data on you or sell you tips — very few help you actually KNOW what you own before you buy. The mission is simple: be wealthy AND wise.

Type up to 10 tickers and in ~30 seconds you get a real, defensible verdict:
• BUY / HOLD / SELL with a confidence rating AND the reasoning — powered by Google Gemini 3.5 Flash
• 50+ fundamentals weighed across two consistent frameworks — Graham Value and Growth & Quality (cash-flow focused): FCF Yield, P/FCF, OCF/NI, Payout Ratio, a Balance Sheet Health score, and more
• A Two-Lenses view that puts the Wall Street rating next to our methodology verdict and explains when each applies
• Compare a whole watchlist at once and get a single Top Pick
• Honest about gaps: no TTM profit? P/E shows N/A and it leans on cash flow instead of pretending the stock is "cheap" — and it caps confidence accordingly
• Export the full report to PDF or Word

Built with a stack I love: Vercel (frontend + serverless), FastAPI on Render, Supabase (auth + the saved analysis history), Cloudflare, and Stripe — shoutouts above 🙏

The recent Gemini 3.5 Flash upgrade is why I'm launching now — it made the analysis noticeably faster and sharper, so you get better information, faster, to make higher-quality decisions.

It's 3 free analyses, no credit card — then packs from $4.99 (≈25¢ per analysis). No subscription.

I'd genuinely love your honest feedback — drop a ticker you're researching and I'll tell you what the framework says 👇
```

---

## 11. The 6 manual steps (only you can do these — ~10 min)
1. Log into **producthunt.com** → **Submit a product** (or **Ship → Coming soon** if you want to collect "Notify me" followers first).
2. Paste blocks **1–6** into the matching fields.
3. Add the **Shoutouts** (step 7), upload the **logo** (step 8) and **gallery** images (step 9, at least #1 + #6).
4. Add **yourself as a Maker**.
5. Set the **scheduled launch date** (step 0 — recommend **Tue July 7**).
6. On launch morning: post the **first comment** (step 10), then notify your channels in waves ("we're live / would love your feedback" — never "please upvote").
