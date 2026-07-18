# WORK ORDER — AI Stock Assist Relaunch (guidance for Claude Code + Founder)

**Product:** AI Stock Assist — https://aistockassist.com · disciplined stock-analysis frameworks on real data, "the card does the arithmetic; you make the decision."
**Repo (this one):** `C:\src\ai-stock-assist-web` (Vercel/React SPA) · Backend: `C:\src\ai-stock-render` (FastAPI/Render).
**Owner:** Lindsay Hiebert · PI GenAI LLC.
**Campaign:** "The App That Shows Its Work" — a Day-1 anchor + a 5-part weekly blog series, all grounded in the July 2026 "Accountability Release."
**This folder:** `docs/relaunch/` — the relaunch hub.

> **How to use this doc:** tasks are tagged **[CC]** (Claude Code can do it) or **[FOUNDER]** (Lindsay does it; CC assists/guides). Do Phase 0 before anything publishes. Publish in the POSSE order in Phase 2. Keep the claims discipline throughout.

---

## READ FIRST
- `AI-Stock-Assist-RELAUNCH-MASTER-CUT-AND-PASTE.docx` — the single master (announcement + 5-part series + all image prompts + social). Source components: `MASTER-RELAUNCH-BLITZ-PACK.docx`, `SERIES-BIBLE-5-PART-ARC.docx`, `ANNOUNCE-relaunch.md`, `IMAGE-PROMPTS-SERIES.md`, `POST-{1,2,3}-*.md`.
- `RELAUNCH-READINESS-REVIEW.md` — what's ready + the fixes (this WO operationalizes it).
- `../GROWTH-STRATEGY-AND-BEACHHEAD.md` and `../SIMPLE-GROWTH-PLAN.md` — the ICP, push→pull thesis, beachhead.
- `../../CLAIMS-REGISTER.md` — the non-negotiable copy discipline.

## GUARDRAILS (non-negotiable)
- **Claims discipline:** no product superlatives, no predictions, no urgency/countdowns. Speed may only be claimed WITH the verification clause. **Never publish a stat that isn't real** (no fabricated numbers, ratings, testimonials, or customer counts). Run `npm run check:claims` before shipping any copy change. When in doubt, quote `CLAIMS-REGISTER.md` verbatim.
- **Grounding:** every market figure (e.g. NVO revenue) must be verified against the live product/card the day it publishes — do not guess.
- **POSSE:** publish the canonical first, then syndicate teasers that link back. Every link points to the canonical, never to a syndication copy.
- **Nothing outward-facing ships without Founder sign-off** on the final voiced copy.

---

## PHASE 0 — PRE-PUBLISH (finish these before the anchor goes out)

### 0.1 [FOUNDER] Voice pass on the flagship
The flagship ("The Rebuild: One Week, Every Number Accountable") is DRAFT v1. Read it aloud, make it yours. CC can apply edits you dictate.

### 0.2 [FOUNDER→CC] Pin the NVO (Novo Nordisk) USD revenue to ONE number
The flagship says "~$50B", the series bible says "~$47B" — inconsistent. **Founder:** confirm the real converted figure and it must match the NVO card screenshot captured on publish day. **[CC]** once given the number: update it consistently across `ANNOUNCE-relaunch.md`, `SERIES-BIBLE-5-PART-ARC.docx`, `MASTER-RELAUNCH-BLITZ-PACK.docx`, `POST-1-*.md`, and regenerate `AI-Stock-Assist-RELAUNCH-MASTER-CUT-AND-PASTE.docx`.

### 0.3 [CC] Align the "capex % of OCF" bridge example
Post 3 uses "40% of OCF" in some places and "60%" in others (LinkedIn vs FB/X). Pick one illustrative number (recommend 40%, matching the series bible) or make it clearly generic; apply across the Post-3 surfaces + the master.

### 0.4 [CC] Fix the cross-brand name in the blitz heartbeat
`MASTER-RELAUNCH-BLITZ-PACK.docx` heartbeat writes "MacroLens" — the brand is "**Macro Lens**" (two words). Fix it (and anywhere else it appears).

### 0.5 [FOUNDER, CC assists] Wire analytics — THE unlock (do not skip)
There is currently **no analytics** on the app, so we can't see what the relaunch does. The app is on Vercel → enable **Vercel Web Analytics** (`@vercel/analytics`) or add a **Plausible** script. Add 3 goal events: `signup`, `first_analysis_run`, `purchase`. **[CC]** can implement the wiring in `apps/web`; **[FOUNDER]** enables the dashboard/toggle. Add **UTM tags** to every campaign link so channel attribution works.

### 0.6 [FOUNDER] Generate the 5 per-post hero images
Prompts are in Part 3 of the master (and `IMAGE-PROMPTS-SERIES.md`). **ChatGPT or Gemini ONLY.** Save to `docs/images/relaunch/` as `Blog-R1-hero-one-card-one-clock.png` … `Blog-R5-hero-graded-not-gated.png`. (The OG/hero `og-relaunch-2026-07.png` is already done.)

### 0.7 [FOUNDER] Capture publish-day screenshots
Per the shot-lists (flagship §4 + each post): NVO FX-footnote card, a caveated "scored on 4 of 6" card, a bridge line, the framework banner in a printed PDF, the pre-flight panel, "Definitions v1.0" footers. Fresh, current prices, on the day.

### 0.8 [CC] Final claims sweep
Run `npm run check:claims`; grep the flagship + all 5 posts + social for any superlative/prediction/urgency/unhedged stat. Confirm the NVO number is consistent everywhere. Green before publishing.

---

## PHASE 1 — CANONICAL DECISION (one call before Day 1)
The pack makes **Substack the canonical home** ("Substack first → Medium canonical link"). That's fine to ship now.
- **[FOUNDER decision]** Optional stronger play: host the canonical on aistockassist.com. But this repo is a React SPA with no blog — a `/blog` + prerender is a real build. **Recommendation:** ship Substack-canonical now; add own-site `/blog` later only if the series earns traffic. **[CC]** can scope/build the `/blog` if you choose it.

---

## PHASE 2 — PUBLISH THE DAY-1 ANCHOR (POSSE order)
Publish the flagship, then syndicate. This is the exact order that worked for Macro Lens.
1. **[FOUNDER] Substack first** — paste the flagship; **print full URLs in the body** (Substack strips pasted links); hero = `og-relaunch-2026-07.png`; embed the 4 screenshots at the placement points. Set comments = Everyone; add tags (Investing, Finance, Stock Market, Economics).
2. **[FOUNDER] Medium** — use **"Import a story"** from the canonical URL (auto-sets `rel=canonical`), or paste + set the canonical link manually in Story settings → Advanced. Tags: Data Science, Investing, Stock Market, Finance, Artificial Intelligence.
3. **[FOUNDER] LinkedIn + Facebook** — post the short version; **link goes in the FIRST COMMENT**, not the body (both platforms throttle body links). Attach the hero.
4. **[FOUNDER] X** — single post + hero image, link in the post.
5. **[CC] After publish** — fill the `[SUBSTACK-URL]` / `[FILL-AFTER-PUBLISH]` placeholders in the social files with the live URLs; log the URLs in `docs/PUBLISHED-CONTENT-TRACKER.md`.
6. **[FOUNDER] Heartbeat** — optionally run one "heartbeat" post from the blitz appendix during the week (keeps a drumbeat without competing).

---

## PHASE 3 — THE WEEKLY SERIES (cadence + gating)
- **Cadence:** Day-1 anchor, then **weekly, same weekday morning: Post 1 → Post 2 → Post 3** (all READY). Same POSSE order each week. A real market event that week takes precedence (news beats schedule).
- **Feature gates (critical):** **Post 4 (Two Lenses)** ships the week **compare mode** launches; **Post 5 (Graded, Not Gated)** ships only after **proximity scoring** is live + burned-in with real near-miss lines to screenshot. **PUBLISH IN GATE ORDER, not number order** — if proximity activates before compare mode ships (likely), run Post 5 in the slot after Post 3 and let Post 4 ride the compare-mode ship week. **[CC]** draft Posts 4/5 in full during their ship weeks so the feature walk matches what actually shipped; **do NOT publish either before its gate.**
- **[FOUNDER] every publish day:** fresh screenshots at current prices; per-post hero attached; `npm run check:claims` after the voice pass.

---

## PHASE 4 — TURN REACH INTO REAL USERS (the part that actually matters)
Broadcast alone won't convert; the ICP is **action-taking, problem-aware self-directed investors already in motion.** Run the beachhead in parallel with the series (see `../SIMPLE-GROWTH-PLAN.md`):
- **[FOUNDER] Beachhead:** r/ValueInvesting (playbook: `docs/REDDIT-ENGAGEMENT-PLAYBOOK.md`) — 15–20 min, 3–4×/week: run a debated ticker through the app, post a polished plain-English read (verdict + 3–4 numbers + honest caveat), **no link**; profile carries it. The "3 free analyses, no card" + "try to catch us" hook is your love-language for that skeptical crowd.
- **[FOUNDER] Talk to the first ~10 signups** — what made them try it, what almost stopped them, would they miss it. Worth more than any dashboard.
- **[CC] Watch the analytics** (once wired): report weekly on signup → first_analysis → purchase, and which channel/post drove each. Do more of what wins.

---

## DEFINITION OF DONE (relaunch)
- [ ] 0.1 voice pass done; 0.2 NVO pinned to one number (matches the screenshot); 0.3 bridge % aligned; 0.4 "Macro Lens" fixed.
- [ ] 0.5 analytics + UTMs live with 3 goal events.
- [ ] 0.6 five hero images generated; 0.7 publish-day screenshots captured.
- [ ] 0.8 `check:claims` green; NVO number consistent everywhere.
- [ ] Phase 2 anchor published across all channels; URLs filled + logged.
- [ ] Weekly series running (Posts 1–3); Posts 4–5 drafted at their gates, not before.
- [ ] Beachhead running; first-signup interviews underway; weekly analytics report established.

*The relaunch isn't "we posted" — it's "we can see real, action-taking users trying and buying, and we're doing more of what works."*
