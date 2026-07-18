# Relaunch Readiness Review — "The App That Shows Its Work"

*Reviewed 2026-07-18. The pack is strong and largely cut-and-paste ready. This is the
readiness map: what's done, what to verify, and what to execute before/at publish.*

## The plan, in one breath

**Day-1 anchor** — *"The Rebuild: One Week, Every Number Accountable"* (the July 2026
"Accountability Release": a week making every number trustworthy after a July 8 self-audit
that caught currency mislabeling, mixed periods, and a non-ticker being scored). **Then a
5-part weekly series** — *"The App That Shows Its Work"* — each post redeeming exactly one
promise with receipts. **POSSE flow:** Substack first → Medium (canonical link) → LinkedIn +
Facebook (link in the FIRST comment) → single X post. Plus a portfolio **"heartbeat" blitz**
(one tiny post per other live app) to keep a drumbeat without competing with the series.

## Readiness status

| Asset | Status |
|---|---|
| Flagship (Substack/Medium) | ✅ READY — DRAFT v1, awaits your voice pass |
| LinkedIn / Facebook / X / changelog | ✅ READY |
| Post 1 — One Card, One Clock | ✅ READY (full draft + social) |
| Post 2 — Always an Answer | ✅ READY |
| Post 3 — The Bridge | ✅ READY |
| Post 4 — Two Lenses, One Stock | ⚪ OUTLINE — **gated on compare-mode shipping** |
| Post 5 — Graded, Not Gated | ⚪ OUTLINE — **gated on proximity-scoring live + burn-in** |
| OG / hero image | ✅ READY (`og-relaunch-2026-07.png`) |
| 5 per-post hero images | ⚠️ PROMPTS READY (`IMAGE-PROMPTS-SERIES.md`) — images not generated |
| 4 flagship screenshots | ⚠️ SHOT-LIST READY (§4) — capture on publish day, current prices |

## What's strong (keep as-is)

- **Claims discipline** (`CLAIMS-REGISTER.md`): no superlatives / predictions / urgency; speed
  only ever claimed *with* the verification clause. Enforced in prompts + `npm run check:claims`.
  This is rare and it's the moat of the whole campaign — don't dilute it.
- **Every claim maps to a shipped feature** (grounded — the July release notes back it up).
- **POSSE-native conventions** already baked in (link-in-first-comment, print full URLs on
  Substack because it strips links on paste, X = single post + image).
- **Voice is consistent**: first-person builder; recurring close *"The card does the arithmetic;
  you make the decision."* Every post teases the next.

## Verify before publishing (market figures — same rule as the Macro Lens oil figure)

1. **NVO USD revenue is inconsistent across docs** — flagship says **~$50B**, series bible says
   **~$47B**, shot-list says **"$47–50B."** Pin **one** number, and it must match the NVO card
   **screenshot captured on publish day** (Novo reports in DKK; the card's dated conversion is the
   source of truth). Do not ship two different figures.
2. **Free-tier + pricing:** "3 free analyses, then ~25¢/stock." Confirm free count = 3 and ~25¢
   (Starter $4.99 / 20 = 25¢; Pro $9.99 / 50 = 20¢) against the live paywall.
3. **Incident examples** (AWS non-ticker, ExxonMobil NOT RATED, XOM capex): all are framed as
   "on July 8th" / historical — good. Keep them past-tense; don't imply they reproduce live.

## Reconcile (minor internal consistency)

- **Bridge % example:** LinkedIn Post 3 uses "capex is 40% of OCF"; the FB/X versions say "60%."
  Pick one illustrative number (or make it clearly generic) so the same story doesn't cite two.
- **Series name:** "The App That Shows Its Work" appears in the social + bible; the flagship lists
  the 5 posts but doesn't name the series. Fine either way — just make it deliberate.
- **Cross-brand:** the heartbeat appendix writes **"MacroLens"** (one word). That brand is
  **"Macro Lens"** (two words). Fix in the blitz pack.

## To execute (like the Macro Lens launch)

- **Generate the 5 per-post hero images** (prompts ready; **ChatGPT / Gemini only** per house
  rule) → save as `docs/images/relaunch/Blog-R{n}-hero-*.png`. Capture the **4 flagship
  screenshots** on publish day (current prices).
- **Fill the URL placeholders** (`[SUBSTACK-URL]`, `[FILL-AFTER-PUBLISH]`) after the flagship
  publishes — inherent to POSSE (publish canonical first, then syndicate).
- **Cadence + calendar:** Day-1 anchor, then **Posts 1 → 2 → 3 weekly** (same weekday AM).
  **Posts 4 & 5 are FEATURE-GATED** — publish in *gate order, not number order* (if proximity
  scoring goes live before compare mode ships, run Post 5 in the slot after Post 3). Pick a
  Day-1 date and I'll add the anchor + Posts 1–3 to Google Calendar (Posts 4/5 stay unscheduled
  until their features ship).

## POSSE note — where the canonical lives

The pack makes **Substack the flagship home** ("Substack first → Medium canonical link"). That's
fine, but it's a weaker ownership position than Macro Lens (whose canonical lives on
getmacrolens.com). aistockassist.com is a React SPA without a blog CMS, so a true own-site
canonical would be a build. **Recommendation:** ship this campaign Substack-canonical now; if the
series earns traffic, add a lightweight `/blog` to the app later so future posts point home.

## Bottom line

Publish-ready pending: (1) your voice pass on the flagship, (2) the NVO figure pinned to one
number, (3) the five hero images generated. Everything else is a publish-day capture. This is a
**stronger starting point than the Macro Lens launch had** — the discipline is already in place.
