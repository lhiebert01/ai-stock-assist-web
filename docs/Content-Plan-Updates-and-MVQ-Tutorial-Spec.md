# Content Plan — Change Audit (post 2026-07-08 shipping) + MVQ Tutorial Spec
**Owner:** Lindsay Hiebert · **Date:** 2026-07-08 · applies to the AI Stock Assist publishing queue
**Staging key (unchanged):** 🟢 publishable now · 🟡 gated on MVQ beta live · 🔵 gated on validation write-up · ⚪ gated on a specific feature flag

---

## PART 1 — DOCUMENT-BY-DOCUMENT CHANGE AUDIT

### 1. Season 1 "Show Your Work" (five kitchen-table stories) — 🟢 GATE NOW OPEN
- Publish gate was hotfixes 002.1/002.2 → **both verified live today. Post 1 is unblocked.**
- Standing rule holds: fresh screenshots on publish day; sync flagged prose numbers.
- UPGRADE, not change: publish-day screenshots now carry the capex/FCF bridge line (002.9 live). Post 4 (AMZN) benefits most — the card now explains its own harshest signal ("capex is 102% of OCF — a heavy investment cycle suppresses FCF"), which IS Post 4's thesis. Let the card make the argument; trim any prose that duplicated it.
- If the verification trace line (002.16) ships before a given post's publish day, prefer screenshots that include it.

### 2. Metrics-Guide-Plain-English-Sections (A–F, live) — three staged edits, no rewrite
- ⚪ **Section B scoring language** ("each pass worth points" — binary) becomes inaccurate the day AISA_PROXIMITY_SCORING activates. Pre-write the v1.1 edit now, ship it WITH the flag flip: add after the six checks — "Scoring counts near-misses: a check missed by a hair earns partial credit inside a narrow band near the bar, and every near-miss is listed on the card ('passed 4 of 6 · one near-miss within 2%'). A marathoner who finishes fifty yards behind the qualifier ran a different race from one who dropped out at mile nine." (Marathon copy already exists in the MVQ Addendum Section H — reuse, keep one canonical phrasing.)
- ⚪ **Section C "NOT RATED" block** becomes stale when WO-ASA-004.2 (Rated-with-caveats) ships. Pre-write: "**Rated — with caveats.** When some figures can't be fetched or verified, the card scores what did verify, lists exactly what's missing and why ('ROE: fetch failed'), and shows a confidence level. **NOT RATED** is now reserved for the rare case we can't trust a stock's identity or currency at all — figures that contradict each other or can't be cleanly converted. Missing data is never treated as bad data; unverifiable data is never scored."
- 🟢 **Section E Debt/Equity temporary note** — delete when 002.5 (D/E convention) ships; add to 002.5's definition-of-done so it isn't orphaned.
- Everything else in A–F: accurate as shipped. Section A's "principles survived, numbers didn't" intro is doing double duty as MVQ's opening argument — leave untouched.

### 3. MVQ-Announcement-Story-Arc — two updates
- **Forward logging decoupled from Act 2** (today's sequencing directive: logging turns on FIRST, before the proximity flag, ahead of any MVQ code). Act 1's flagship post gains a stronger line: evidence accumulation has ALREADY started — "every production score is being archived with its date stamp as you read this." Move the "forward-logging note" bullet from Act 2 to Act 1.
- **New Act 2 post candidate** from today's provenance work: "We made it impossible to fake our own receipts" — append-only score logs, engine-emitted version stamps, the database refusing provenance edits, and why pre-schema records are excluded rather than backfilled. It's the NVO lesson applied to our own data about ourselves, and no competitor writes this post. (Claims-safe: describes our controls, claims nothing comparative.)
- Act 1 dependency reminder unchanged: wait for WO-ASA-004 P0 shipped — CONFIRMED SHIPPED today, so Act 1's remaining gates are just the pre-registration doc + 005.2 tooltips + guide Section G.

### 4. Seven-Opinions-and-a-Receipt (bonus episode) — no changes
- Publishes as written in its queue slot. Its sequel concept ("two of OUR OWN opinions and a receipt" — MVQ vs Graham Classic in compare mode) stays 🟡 and is now formally the MVQ Tutorial episode's sibling (Part 2 below). Decoder-table weave-in lines unaffected.

### 5. Season 2 "Two Games" plan — one addition, no restructure
- E6 (honest-limits/Wirecard) unchanged. ADD one beat to the season spine: the pre-registration ritual — Frank writes his prediction, seals it in the recipe box, checks it later. Mirrors Act 1 of the announcement arc at kitchen-table scale. Feature-request register (OCF/NI sparkline, receivables-vs-revenue, adjustment-recurrence) unchanged → still WO-ASA-003+.

### 6. Product Review Summary (2026-07-08 docx) — no changes
- Historical record of the incident; freeze as-is. It becomes source material for the Act 1 flagship's "why Graham Classic fails modern balance sheets" section (cleaned/anonymized per the arc).

## PART 2 — MVQ TUTORIAL SPEC (one source, two formats)

**Working title (both formats):** "The Same Six Questions" — Frank's questions never change; the numbers answering them do.
**Staging:** DRAFT now · PUBLISH 🟡 with MVQ beta (Act 2's anchor content). The evergreen page can go live the same day as the beta toggle; the episode follows in the weekly slot.

### Format A — Evergreen "MVQ 101" page (Learn section; AEO/citation asset)
Plain-English walkthrough, ~1,400–1,800 words, one cleaned card screenshot per section, anchored for tooltip deep links. Structure = Lindsay's seven questions, in order:
1. **What it shows** — five pillars, one composite score, same BUY/HOLD/SELL bands you already know.
2. **Why these metrics** — each pillar as "old question, modern number" (table from guide Section H, condensed): cash-flow value vs book value; ROIC−WACC vs static P/E caps; sector-aware debt vs current ratio 2.0; earnings-reality checks Graham couldn't run; growth persistence vs growth distrust.
3. **How it works** — deterministic arithmetic, near-miss partial credit (marathon paragraph, canonical phrasing), cohort disclosure, verification trace. "Reproducible with a spreadsheet" claim + link to full methodology.
4. **Why it's relevant for today's investor** — rates move what "cheap" means; balance sheets changed shape; buybacks replaced half of dividends; capex cycles (AI infrastructure) suppress FCF without meaning decline — the bridge line shows which is which.
5. **What to look for** — read the card top-down: verdict → confidence → near-misses → what's missing (caveats) → What Would Change This Verdict.
6. **How IT decides vs how YOU decide** — the canonical boundary: the card does the arithmetic; you bring horizon, temperament, and position size. Includes the two-lenses paragraph: when MVQ and Graham Classic disagree, the disagreement is the information.
7. **How to decide** — worked example, one real ticker, both frameworks side by side, walking the divergent checks. Ends on the watch-level discipline (circle your price; bring the waiting).
Footer: methodology version, validation status ("pre-registered test in progress — results publish either way, win or lose"), link to pre-registration.

### Format B — Character episode (Season 2 insert or special)
**Title:** "Frank's Rules, Maya's Numbers" (alt: "The Recipe Didn't Change")
**Device:** Frank IS Graham Classic — he learned the 1949 rules when they were current. This is the episode's engine: MVQ never corrects Frank; it vindicates his QUESTIONS while updating his NUMBERS.
Beats:
1. Cold open: Frank fails a stock he loves against his index-card rules (current ratio 1.4 — "in my day that was a red flag"). Maya runs the same ticker: MVQ rates it differently.
2. The argument — staged as compare mode on one screen. Same data stamp. Frank's lens and Maya's lens disagree, and the card lists exactly which checks diverged. Neither is wrong; they're asking with different-era numbers.
3. Pillar walk — Maya translates each of Frank's five instincts into its modern measurement ("you always said 'trust the cash, not the bookkeeping' — this check is literally that, automated"). One pillar per scene beat, kitchen objects as props (the recipe box = principles; the yellowed index cards = thresholds).
4. The marathon beat — Frank's own story (he ran one at 50) carries the near-miss scoring explanation.
5. Close: Frank doesn't convert; he adds a second lens. "Run it both ways. When my rules and your rules agree, I sleep well. When they argue, THAT'S where I start reading." Final card on screen shows both verdicts + the trace line.
**Tagline continuity:** "Know your game. Verify your numbers. Circle your price. Bring the waiting." — Frank adds: "…and ask the same six questions your whole life. Just let the numbers grow up."
Image prompts/alt/captions/placement checklist: follow Season 1 Publication-Ready format.

### Claims guard for both formats
No "superior/replaces/beats." MVQ "extends" and "modernizes"; Graham Classic is "the questions at their birth." Validation referenced as in-progress commitment, never as implied success.
