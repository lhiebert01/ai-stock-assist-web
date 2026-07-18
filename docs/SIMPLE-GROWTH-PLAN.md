# AI Stock Assist — The Simple Growth Plan

*Written 2026-07-18. One small step a week. Most steps use assets you've ALREADY built.*

## The honest starting point

You don't have a content problem — you have a **measurement + execution** problem. The Reddit
playbook, the Product Hunt kit, the distribution list, the relaunch series, the free-tier CTA —
**all already built.** The one real gap is **you have no analytics**, so you can't see what works.
This plan turns on the lights, fires the ready shots, and adds one small experiment each week.

**The rule:** one step per week, ~1–2 hours. Never more. Small steps compound; heroics don't.

**The one number that matters:** *signup → first analysis → first paid pack.* Everything else is vanity.

---

## WHO we're for (this drives every channel, hook, and CTA)

**The target: people already in motion.** Self-directed investors who *care*, *take action*, *have
the exact problem we solve* (fundamental research is tedious, slow, and error-prone), and are glad
to try an excellent tool that makes them smarter and faster. They research before they buy; they
value rigor, discipline, and analysis they can *check.*

**The qualifier is behavior, not demographics.** Someone publicly asking "is NVDA a buy?", debating
a company's FCF, or comparing valuation frameworks is — right now — an action-taker *with the
problem, in motion.* That intent *is* the qualification. We don't need to persuade them a problem
exists; they're already working on it.

**Who we are NOT for (and that's fine — stop grieving them):** passive scrollers, meme-chasers,
"just give me a hot tip" tourists, anyone who won't do any work. They will never respond, and their
non-response is **not a signal about the product.** We stop measuring ourselves against people who
were never the buyer.

**Why this makes everything easier:**
- **Channel** becomes obvious → go where they're *already in motion*: ticker searches (SEO/AEO),
  "is X cheap?" threads (Reddit), tool directories, Product Hunt. Not cold feeds.
- **Hook** becomes obvious → not "here's a tool," but *"here's the rigorous read on the exact ticker
  you're already researching."*
- **CTA** becomes obvious → *"try it on a stock you're looking at right now — 3 free, no card."*
- **Success metric** becomes honest → real users who take action, not impressions from people who won't.

---

## PHASE 1 — SEE (Weeks 1–2): turn on the lights + fire a ready shot

**Week 1 — Wire analytics (the unlock).** ~30 min.
- The app is on Vercel → enable **Vercel Web Analytics** (dashboard toggle + `@vercel/analytics`),
  or drop a **Plausible** script tag. Either is tiny.
- Add 3 goal events: `signup`, `first_analysis_run`, `purchase`.
- That's it. Now every step after this is *measurable* instead of a guess.

**Week 2 — Launch on Product Hunt.** Your kit is done (`launch-assets/`).
- Submit (SUBMIT-NOW doc), post the prepared PH social, be present in comments all day.
- One-time traffic spike + a real backlink + your first real-user cohort to *watch in analytics.*
- Outcome to capture: how many signups? how many ran an analysis? how many bought? That ratio is
  your baseline.

---

## PHASE 2 — BEACHHEAD (Weeks 3–6): the Reddit reputation engine

Your `REDDIT-ENGAGEMENT-PLAYBOOK.md` is the motion. It's the highest-fit, ready-to-run channel.
The engine: *be unmissably useful in comments → curiosity → your profile carries the link.*

**The recurring habit (runs the whole phase):** 15–20 min, 3–4×/week — find an "is X cheap / a buy?"
thread in **r/ValueInvesting** (or r/stocks "why is X down?"), run it through the app, post a polished
plain-English read (verdict + 3–4 numbers + honest caveat), **no link**. Reply to follow-ups for an hour.

**One small step layered on top each week:**
- **Week 3:** Start the habit in r/ValueInvesting only. Note which comments draw profile visits.
- **Week 4:** Add r/stocks. **Message your first 2–3 signups** — "what made you try it, what almost
  stopped you." (This is worth more than any dashboard.)
- **Week 5:** Publish the **relaunch flagship** ("The Rebuild") to Substack/Medium, and bring **one
  insight** from it into a Reddit thread as genuine help (the currency-mislabel warning, the FCF bridge).
- **Week 6:** Publish **Post 1 — One Card, One Clock.** Check analytics: which touch actually drove
  signups — PH, Reddit, or the posts? **Do more of whatever won.**

**Goal for the phase:** not 1,000 signups — **~10 real weekly users** who give feedback. A beachhead.

---

## PHASE 3 — COMPOUND (Weeks 7+): build pull that works while you sleep

One small build per week; each keeps working after you ship it.

- **Long-tail ticker pages (the big lever).** Scope one indexable page template
  ("AI Stock Assist analysis of AAPL") targeting *is X a buy / X fair value / X FCF yield.* Ship one,
  measure if it ranks/gets cited, then templatize. This is how Finviz/SimplyWall.St got adopted.
- **Product-share loop.** Add a subtle "analyzed with AI Stock Assist" credit on the shareable card
  → users' followers (fellow investors) see it in context. The output becomes the marketing.
- **Dogfood AEO Analyzers on aistockassist.com** — you own the exact tool for answer-engine
  visibility. Run it, fix what it flags.
- **Continue the series** (Posts 2, 3; Posts 4–5 when their features ship) + weekly Reddit habit.

**Later / R&D:** LinkedIn posting automation as **shared cross-app infra** (gated API — start with a
scheduler; build custom only once it's worth it across the whole portfolio).

---

## The whole plan on one line

**Week 1 analytics → Week 2 Product Hunt → Weeks 3–6 Reddit + publish the series → Week 7+ ticker
pages + share loop + AEO.** One step a week, measured, aimed at intent — not sprayed at feeds.

## If you only do ONE thing this week
Wire the analytics. Everything else is guessing until you can see the funnel.
