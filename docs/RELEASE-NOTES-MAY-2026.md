# Release Notes — May 2026

## May 22, 2026 — Production hardening: MCHP NaN crash fix + friendlier error UX

### What shipped

#### 🐛 Critical fix — MCHP (and similar tickers) returning HTTP 500 across the whole batch

**Symptom:** Users analyzing certain tickers (notably Microchip Technology / MCHP) saw a bare `"Load failed"` (Safari) or `"Failed to fetch"` (Chrome) message. If MCHP was bundled with other valid tickers like AAPL, the *entire batch* failed — even AAPL didn't render.

**Root cause:** yfinance returns `NaN` for missing-data fields on tickers in unusual financial states (MCHP at the time had near-zero earnings, NULL FCF, NULL `earningsGrowth`, payout ratio 8.27). The backend's `compute_snapshot()` returned a dict containing those NaN values, which `json.dumps()` rejects. FastAPI returned HTTP 500. The exception happened *after* the per-ticker try/except had already accepted that snapshot, so one bad ticker poisoned the whole response.

Confirmed from Render logs:
```
ValueError: Out of range float values are not JSON compliant: nan
  when serializing dict item 'latest_revenue'
  when serializing list item 1
  when serializing dict item 'snapshots'
```

**Fix — backend** (`ai-stock-render` commit `f6c80ac`):
- New `_to_json_safe()` helper recursively coerces NaN/inf → None and numpy scalars → Python primitives. Applied to `compute_snapshot()`'s return value. Every snapshot is now guaranteed JSON-serializable.
- `/api/analyze` now logs full tracebacks on per-ticker failures so future yfinance-induced edge cases are diagnosable from Render logs alone.

**Files changed:**
- `api/lib/stock_analysis.py` — added `_to_json_safe()` and wrapped `compute_snapshot()` return
- `api/server.py` — added `traceback` import and full-traceback logging in `/api/analyze`

#### 💬 Friendlier fetch-error message (frontend)

**Symptom:** When the backend hit a 5xx or the request couldn't reach it, users saw raw browser strings like `"Load failed"` with no guidance on what to do or whether their credits were charged.

**Fix — frontend** (`ai-stock-assist-web` commit `da9ebfe`):
- New `friendlyErrorMessage()` helper in `src/services/stockApi.ts` catches both fetch-level `TypeError` (cross-browser: "Load failed" / "Failed to fetch" / "NetworkError") and vague 5xx responses (`API error 5\d\d`).
- Message now includes the attempted tickers, reassures users no credits were charged, and gives two concrete next steps (refresh, or sign out/in).
- `StockAnalyzer.tsx` catch block now routes through the helper.

**Behavior:**
- Before: `"Load failed"` (single cryptic line)
- After: `"Couldn't complete the analysis for AAPL, MCHP — no credits were used. This is usually a brief network blip; please refresh and try again. If it keeps failing, double-check that every ticker is a valid US-listed symbol (rare, OTC, or delisted tickers sometimes can't be analyzed), or sign out and sign back in."`

Non-network errors (auth 401, per-ticker validation errors) still surface their real messages unchanged.

#### 🔑 Gemini API key rotation

Old key was returning `400 INVALID_ARGUMENT. 'API key not valid.'` on every analysis. The Groq fallback was succeeding so user-facing analysis still worked, but every call paid the latency of a failed Gemini attempt before falling back. Rotated key in Render env vars for `ai-stock-render-api`. Confirmed `Gemini succeeded` in logs post-rotation.

---

## May 21, 2026 — Marketing launch: "The Library Is Now an App" + cross-link to Learn tab

### What shipped

#### 📚 Library piece flagship marketing launch

Standalone re-activation flagship after the 5-week gap since Episode 4. Published across all primary channels in a single day:

- ✅ **Substack:** [The Library Is Now an App](https://lindsayhiebert.substack.com/p/the-library-is-now-an-app)
- ✅ **LinkedIn:** [6-slide carousel + emoji-rich caption](https://www.linkedin.com/posts/lindsayhiebert_investing-valueinvesting-benjamingraham-ugcPost-7463312577318576128-V-wq) (Substack URL in first comment to preserve algorithm reach)
- ✅ **X:** [7-tweet thread](https://x.com/Lindsay_Hiebert/status/2057550760808796425) with emoji-rich style (📚 / ❌ / 🚀 / ⚡ / ✅ / ⚠️)
- ✅ **Facebook:** [Multi-image post](https://www.facebook.com/share/p/1BF2VUsZsu/) with 5 images + conversational ~210w caption

Reddit + Medium follow-ups deferred.

#### 🛠️ Distribution toolkit (reusable)

- **New build script:** `docs/scripts/build_library_distribution_pack.py` — generates a paste-ready multi-channel `.docx` from Python (cloneable for future episodes).
- **Generated artifact:** `docs/exports/blog-the-library-is-now-an-app-DISTRIBUTION-PACK.docx` — all channel variants with `✂ START COPY HERE` / `✂ END COPY HERE` markers, Normal-style paragraphs (zero indent — fixes the Substack/LinkedIn paste-corruption bug that "Intense Quote" caused).

#### 🔗 Website cross-link

`src/components/LearnPage.tsx` — Library added to `featuredArticles[0]` with `tag: 'Latest'`. Now surfaces at the top of the Learn tab so visitors arriving from LinkedIn/X/FB posts see the longread featured.

#### 📋 Episode 5 prep (for next launch)

- Fixed Substack paste-corruption in THE MATH callout (`docs/blog-episode-5-the-trap.md`): converted bullets-inside-blockquote (which rendered as literal dashes in "Intense Quote" paragraphs) to a real bullet list. Regenerated as `v8.docx`.
- Three content fixes still open: J&J total-return math (L130), FCF Yield phrasing (L101), three-numbers cross-channel alignment.

---

## Bugs spotted but not yet fixed (rolling backlog)

These were exposed during the May 22 MCHP investigation and noted for future work — none currently blocking users:

1. **Dividend Yield 100× scaling bug** — yfinance returns `dividendYield` as a percentage value (e.g., `0.34` = 0.34%) but `StockCard` treats it as a fraction and multiplies by 100. AAPL shows "Div Yield: 35.00%" (actual: ~0.34%); MCHP shows "Div Yield: 200.00%" (actual: ~1.95%). Affects every dividend-paying stock. Single-file frontend fix in `StockCard.tsx`.
2. **Chart "Failed to load" for MCHP** — `/api/chart-data` endpoint fails specifically for MCHP. Likely yfinance history call timing out. Separate from main analysis flow.
3. **Verdict text truncation** — MCHP verdict ends mid-sentence ("Valuation is absurdly high, cash flow"). Possible string-length limit or partial AI response not handled.
4. **AI Stock Assist API service drift** — `render.yaml` defines `ai-stock-assist-api` but DNS points `api.aistockassist.com` at `ai-stock-render-api`. Two FastAPI services drifting in parallel. Cleanup planned for June 2026 (see [PROJECT-CLEANUP-PLAN-JUNE-2026.md](./PROJECT-CLEANUP-PLAN-JUNE-2026.md)).
