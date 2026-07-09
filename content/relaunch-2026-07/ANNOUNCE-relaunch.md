# ANNOUNCE-relaunch.md — content/relaunch-2026-07/
**Status:** DRAFT v1 for Lindsay's voice pass · claims-register checked · 🟢 gate open
**Channels:** §1 Substack/Medium flagship · §2 LinkedIn short · §3 app changelog blurb
**Publish-day tasks:** fresh screenshots per shot-list (§4) · verify anchor links · final register grep

---

## §1 — FLAGSHIP (Substack / Medium)

# The Rebuild: One Week, Every Number Accountable

AI Stock Assist exists to do one job for you: compress the research legwork of fundamental analysis — pulling the figures, computing the ratios, cross-checking periods and currencies, organizing it all into a decision-ready card — from hours per ticker into about a minute for up to ten at once. Value, growth, income, and momentum investors read the same card differently, and it's built to serve all of them: framework verdicts for the disciplined, raw verified metrics for the do-it-yourselfers, precomputed watch levels for the patient, Wall Street's consensus alongside for contrast.

For any of that to be worth your minute, every number on the card has to be trustworthy — grounded, checked, dated, and reproducible by you. This post is about the week we spent making that promise enforceable instead of aspirational. It starts with us doing what we ask you to do.

On the morning of July 8th, we checked our own math.

We ran two reports through AI Stock Assist and read them the way a skeptical reader would — recomputing the ratios from the raw figures on the page. Most of it held. Some of it didn't. One foreign stock's revenue was displayed in its home currency but labeled as dollars, which made the company look several times cheaper than it is. One card mixed figures from different reporting periods, producing ratios that looked precise and meant nothing. And a ticker that doesn't exist — "AWS" is a business segment, not a listed security — had been scored anyway, converting an empty data feed into a verdict.

Here is the uncomfortable truth behind all three: financial data is messy everywhere. Feeds mix currencies. Vendors restate figures. Fields arrive empty. Every analysis tool on the market is built on top of that mess. The difference between tools is not whether the mess exists — it's whether the tool has the discipline to catch it before a number reaches you.

We didn't have enough of that discipline. So we spent a week building it. This post is the receipt.

## What we built

**One card, one clock.** Every analysis card now carries a single "Data as of" stamp, and every number on that card comes from that one period. Mixing last quarter's profit with last year's revenue is now structurally impossible — a cross-consistency check recomputes the displayed ratios from the displayed figures and refuses to render a card that disagrees with itself.

**One card, one currency.** Foreign issuers' figures are converted at a single dated exchange rate, printed at the bottom of the card. The stock that started all this — a Danish company whose kroner had been dressed as dollars — now shows revenue of about $50 billion with the conversion rate and date in the footnote, instead of a fictional $309 billion. If a card can't be converted cleanly, it doesn't render at all.

**Always an answer, honestly labeled.** Missing data used to produce silence — a NOT RATED stamp with no explanation, sometimes on companies as data-rich as they come. Now the framework scores every check it can verify, tells you exactly which inputs were missing and why ("ROE: unavailable from the data source"), renormalizes the score across the checks that remain, and shows a confidence level. Missing data is never treated as bad data — and it's never treated as a reason to say nothing.

**The narrative answers to the arithmetic.** The plain-English sections of a report are now generated from the computed verdicts, and a validator checks them against each other before anything renders. A stock the scorer rates HOLD cannot be crowned "top pick" three paragraphs later. If that sounds like a low bar — it is, and most AI-written analysis doesn't clear it, because prose generators drift unless they are structurally bound to the numbers. Ours now is.

**Every threshold lives in exactly one place.** We found that our quick-reference sidebar and our full Metrics Guide had drifted apart — same metric, different "risky" thresholds, depending on which page you read. That's what happens when numbers are re-typed by hand across surfaces. All definitions, formulas, tiers, and scoring thresholds now live in a single versioned dictionary (you'll see "Definitions v1.0" in the footer of both pages), and our build system rejects any code that tries to hardcode a threshold anywhere else.

**A permanent, tamper-evident record.** Every verdict the system produces is now archived with its data snapshot, its date stamps, and the exact version of the scoring arithmetic that produced it — in an append-only log that refuses edits at the database level. We built this for a reason we'll say more about soon: we intend to test our own frameworks publicly, and a test is only as credible as the record it runs on.

**Smaller things you'll feel immediately.** Every report now states its analysis framework at the top — on screen, in the PDF, in the Word export, and on anything you print. Typos and non-tickers are caught before a run starts, all at once, in one panel, with no credits spent. The Graham framework is now labeled what it is: **Graham Classic**, Benjamin Graham's 1949 criteria, unmodified — a historical lens and a useful sparring partner for the modern one.

## What we verified

Fixes claimed are not fixes proven, so we re-ran everything. The batches that failed on July 8th now rate every name or explain precisely why they can't. The corrupted foreign-currency card that once produced a false BUY now either converts cleanly or refuses to render — we keep that broken fixture around as a canary, and every future change to the scoring must still trip it. Exports that used to fail now produce documents whose every section agrees with itself.

## The standard, going forward

The claim this product makes is narrow and checkable: **the card does the arithmetic; you make the decision.** For that to mean anything, you have to be able to check the arithmetic — so every card shows its data date, its currency handling, its per-check results, what's missing, and what would change the verdict. A reader with a spreadsheet can reproduce any score on any card. That's the standard, and this week it stopped being an aspiration and became enforcement: gates in the code, one dictionary for every number, and a log that can't be quietly edited.

Two honest limits, so this doesn't read like a victory lap. First, data feeds will fail again — that's their nature; what changed is that failures now degrade loudly instead of lying quietly. Second, the scoring thresholds themselves are judgment, not physics. We think some of them are too strict for how modern balance sheets work, and rather than assert that, we're preparing to test it — publicly, with the success criteria written down before the results exist. More on that when the pre-registration is ready.

## What this means for you

Strip away the engineering and here's the bottom line. **Hours become minutes** — the legwork that takes an afternoon per ticker by hand now takes about a minute for ten, and the output isn't a summary, it's the worked arithmetic. **One set of verified facts serves every decision style** — whether you screen on value, growth, income, or momentum, the card gives you the framework verdict, the raw metrics for your own thresholds, and the analyst consensus for contrast, all from one dated snapshot. **Your watch levels come precomputed** — every HOLD and SELL states the exact price at which the verdict would flip under today's numbers, so you can circle a figure and bring the waiting. And **you always know how much weight a verdict can bear** — when data is missing, the card says so, names the gap, and lowers its stated confidence rather than bluffing.

None of this predicts anything, and none of it is advice. It's assisted expertise: the tool gets you to the informed-judgment stage faster, and the judgment — horizon, temperament, position size — stays yours.

## What's next in this series

Over the coming weeks we'll walk through each of these one at a time, in plain English, with real cards:

1. **One Card, One Clock** — how mixed dates and mixed currencies quietly fabricate bargains, and the stamps that stop it.
2. **Always an Answer** — what "Rated, with caveats" means and why silence was the wrong response to missing data.
3. **The Bridge** — why heavy capital spending makes great businesses look cash-poor, and the one line that tells you which is which.
4. **Two Lenses, One Stock** — what happens when a 1949 framework and a modern one argue over identical data. *(Ships with a feature we think you'll like.)*
5. **Graded, Not Gated** — the marathon problem in pass/fail scoring, and what we're doing about it.

If you've read this far, run something. Pick a ticker you know well, read the card top to bottom, and try to catch us. That's not a dare — it's the product working as intended.

*The card does the arithmetic; you make the decision.*

— Lindsay Hiebert, AI Stock Assist

*AI Stock Assist provides AI-generated analysis for educational purposes only. This is not financial advice.*

---

## §2 — LINKEDIN SHORT VERSION

**We spent a week making every number in our product accountable. Here's the receipt.**

On July 8th we audited our own stock-analysis app the way a skeptical reader would — recomputing the ratios on the page from the raw figures. We found problems: a foreign stock's home-currency figures labeled as dollars, one card mixing reporting periods, a non-existent ticker that got scored anyway.

The truth is that financial data is messy everywhere — feeds mix currencies, vendors restate, fields arrive empty. The difference between tools is whether the discipline exists to catch it. Ours needed more. One week later:

→ Every card carries one date stamp and one dated currency conversion, cross-checked before render
→ Missing data now produces a scored, caveated, confidence-labeled verdict — with the missing fields named — never silence
→ The plain-English narrative is validated against the deterministic verdicts before anything renders
→ Every threshold in the product lives in one versioned dictionary, enforced by CI
→ Every verdict is archived in an append-only log with the exact scoring version that produced it

The standard is narrow and checkable: a reader with a spreadsheet can reproduce any score on any card. The card does the arithmetic; you make the decision.

Full write-up, including what broke and how we verified the fixes: [link]

There's a management-theory angle to where this product goes next — Sloan adjourned meetings when everyone agreed, and Drucker built a method on that instinct. More on engineered disagreement soon.

---

## §3 — APP CHANGELOG BLURB

**July 2026 — The Accountability Release.** Every card now shows one data date, one dated currency conversion, and its analysis framework — on screen, PDF, Word, and print. Missing data produces a scored verdict with named gaps and a confidence level instead of silence. All metric definitions live in one versioned dictionary (Definitions v1.0). Symbol problems are caught before a run starts, all at once, credit-free. Graham framework relabeled **Graham Classic**. Full story: [link to flagship].

---

## §4 — SCREENSHOT SHOT-LIST (capture on publish day, current prices)

1. NVO card: FX footnote + revenue ~$50B (flagship §"one currency" + Post 1 reuse)
2. ET Graham card: NOT RATED telemetry naming all 5 missing inputs (always-answer section)
3. Any caveated card: "SCORED ON 4 OF 6 CHECKS (RENORMALIZED)" + confidence line
4. XOM card: capex bridge line ("capex is 61% of OCF…")
5. Framework banner on a fresh report + same banner visible in a printed PDF page 1
6. Sidebar + guide footers both showing "Definitions v1.0"
7. Pre-flight panel: "2 symbols need your attention — no credits were used"
8. History view: "Saved analysis from [date] — prices reflect that point in time" banner

## §5 — IMAGE PLAN

**HERO (also OG/social card):** hero-relaunch-1200x630.svg (delivered alongside this file; convert to PNG for Substack/LinkedIn upload). Motif: receipt checklist + stylized verified card in app palette.
Alt text: "Dark analysis card labeled CHECKED with a dated data stamp, beside a receipt of verification promises: one clock, one currency, gaps named, scores reproducible."
Optional illustrated alternate (if you prefer your AI-image style): PROMPT — "A clean modern financial analysis card glowing on a dark navy desk, a vintage paper receipt curling beside it with green checkmarks, single desk lamp, cyan and emerald accents, minimal, editorial illustration, no text" — then overlay the title in your header workflow.

**EMBEDDED (in order of appearance, all from §4 shot-list):**
1. After "one currency" paragraph → NVO card FX footnote (shot 1). Caption: "One dated conversion, printed on the card."
2. After "Always an answer" paragraph → caveated-card screenshot (shot 3). Caption: "Scored on what verified; gaps named; confidence stated."
3. After "smaller things" paragraph → framework banner in a printed PDF (shot 5). Caption: "The methodology travels with the page."
4. Before the CTA close → pre-flight panel (shot 7). Caption: "Two problems, one panel, zero credits."
LinkedIn short version: hero only. Changelog: no image.

## CLAIMS CHECK NOTES (for register grep)
- No superlatives, no "only app," no predictions, no urgency. ✓
- MVQ referenced only as unnamed public-validation intent ("preparing to test it… pre-registration"). ✓
- Post 5 teased without asserting proximity is live ("what we're doing about it"). ✓
- Incident framing = industry-truth + our discipline, never confession-spiral. ✓
