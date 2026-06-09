# Release Notes — June 2026

Frontend: `ai-stock-assist-web` (Vercel) · Backend: `ai-stock-render` (Render)

## AI model
- **Upgraded primary model Gemini 3.1 Pro Preview → Gemini 3.5 Flash (GA)** across both backend services + all user-facing copy. Same API keys. Equivalent analysis quality at ~20–30% faster, lower cost (validated by an A/B harness).

## Correctness fixes
- **Answer truncation** — `call_gemini_with_retry` used `max_output_tokens=500` + dynamic thinking, so thinking consumed the budget and analyses truncated after ~2 lines (or emptied → silent Groq fallback). Raised default cap to 2048, comparative to 8192, switched to `thinking_level="low"`. Reports are now complete.
- **Dividend yield 100× too high** — yfinance now returns `dividendYield` as a percent (not a fraction); normalized at the source. (e.g. CSCO 140% → 1.40%.)
- **ROE blank in the comparative table** — `generate_comparative_analysis` read a nonexistent `s.get("roe")`; now reads `screening_metrics.return_on_equity`.
- **Missing P/E handled honestly** — P/E is undefined when trailing earnings ≤ 0. It was defaulting to `0`, which read as "dirt cheap" and falsely passed the Graham Number → unwarranted BUYs. Now: P/E shows **N/A** with the reason ("not profitable TTM" vs "data unavailable"); the model is told not to treat it as cheap, to lean on cash flow, and to cap confidence; Graham criteria are marked "cannot evaluate" (no clean value-framework BUY without P/E). A visible amber advisory appears on the card, in PDF/Print, and in the Word export. See [[lesson_missing_metric_zero_bias]].

## Reports & export
- **PDF export "invisible text" fixed** — html2canvas dropped inherited CSS-variable colors, so ticker symbols/prices rendered black-on-black on the dark theme. PDF now captures on a **white, high-contrast print theme** (near-black text, dark teal/green/red/amber) via `onclone` — **the live app stays dark**.
- **Browser Print** now uses the same white/high-contrast theme (`@media print` token remap).

## SEO / AEO
- AEO score 30 → 96 (static JSON-LD: Organization/WebSite/SoftwareApplication/FAQPage/HowTo/Person + crawlable `<noscript>`; www-canonical sitemap/robots).
- SEO head enrichment: `max-image-preview:large`, `max-snippet:-1`, `og:locale`, `og:image:alt`, `twitter:site`/`creator`.
- Known SEO ceiling: single-URL SPA → only `/` is indexable. Multi-page routing + prerender is the next growth lever (scoped, not yet built).

## Content
- Learn page reorganized into a reader arc (Start Here → series → segue → frameworks → AI for Good) + "Powered by Gemini 3.5 Flash" band; Episodes 5 & 6 added to the series grid.
- Episode 6 "The Two Maps" published and syndicated (Substack, LinkedIn, FB, X, Reddit).
