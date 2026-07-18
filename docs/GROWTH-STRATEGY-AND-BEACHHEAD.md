# AI Stock Assist — Growth Strategy, Beachhead & Roadmap

*Written 2026-07-18. The product is excellent; adoption is low. The gap is almost never
product or copy — it's **distribution motion**. We've been running a PUSH motion (broadcast
social) that suits announcements, not adoption. The plan: keep a real beachhead alive now,
and shift effort toward PULL channels (intent) over time.*

## The core diagnosis (keep this in front of every decision)

- **Push = interrupt someone scrolling.** Good for announcements, weak for adoption of a
  considered-purchase tool. Reach ≠ signups ≠ paid runs; the funnel leaks 90%+ at each step.
- **Pull = be present at the moment of intent.** People adopt a stock tool when the job fires:
  *"is NVDA a buy?" "what's Novo's real P/E?"* Win where the intent is, not where the attention is.
- **"Users don't read/think" is a comfort trap.** The real issue: wrong audience (our feeds are
  our professional network, not retail investors) + first-touch cold traffic doesn't convert +
  push/pull mismatch. All fixable; "users are lazy" isn't.

---

## Part 1 — BEACHHEAD (do now): r/ValueInvesting

Don't try to win "social media." Win one narrow niche, get ~10 real users, learn, expand.
(Crossing the Chasm.) For AI Stock Assist the tightest fit is **r/ValueInvesting**
(adjacent: r/SecurityAnalysis, r/stocks).

**Why it fits:**
- They argue about exactly what the card computes — FCF quality, Graham numbers, cheap-on-paper vs. real.
- Skeptical + methodical: the crowd most likely to dismiss "AI stock picks," most likely to respect
  a tool whose whole pitch is *reproducible, checkable, shows its arithmetic.* Our differentiator is
  their love language.
- Discussion-first, high-intent — the opposite of a scrolling feed.

**The motion — value-first, never link-drops (3-week cadence):**
- **Week 1–3:** show up genuinely. When someone debates a ticker, post a **worked contribution** —
  the FCF bridge, the Graham divergence, the caveats — leading with the insight, not the URL.
- People ask *"how'd you pull that together so fast?"* → that's the pull. Then, naturally:
  *"a tool I built — 3 free, try to break it."* The **"try to catch us"** hook flips their
  AI-skepticism into an invitation; that crowd loves trying to break things.
- Respect each sub's self-promo rules; participate first, link rarely.

**Goal:** not 1,000 signups — **10 real weekly users** who give feedback and maybe advocate.

**Contribution templates (so you never face a blank box):**
1. *Cheap-on-paper check:* "Ran [TICKER]: revenue in [currency] converted at [rate/date]; FCF
   bridge OCF $X − capex $Y = FCF $Z (capex Z% of OCF). The 'cheap' was [real / a period-mix /
   an FX artifact]. Here's the worked card."
2. *Missing-data honesty:* "[TICKER] scored on 4/6 checks — ROE and balance-sheet data didn't
   verify from the feed, so confidence is LOW and the gaps are named rather than zero-filled."
3. *Two-lens divergence:* "Growth&Quality rates [TICKER] HOLD, Graham Classic rates it SELL —
   they disagree on [checks]. Graham's strictness is the point, not an error. What's your read?"

**Track the first 10:** literally ask each — *what made you try it, what almost stopped you,
would you miss it.* Worth more than any dashboard right now.

---

## Part 2 — PULL CHANNELS (near-term, highest leverage)

### 2a. Long-tail AEO/SEO — the biggest lever
- **Programmatic ticker pages.** A lightweight, indexable page per ticker
  ("AI Stock Assist analysis of AAPL") targeting the long tail: *is X a buy, X fair value, X FCF
  yield, X Graham number.* Each query is low-volume + low-competition + **high-intent**; thousands
  of them sum to real, compounding traffic. This is how Finviz / SimplyWall.St / Koyfin actually
  got adopted — ticker-page SEO, not clever posts.
- **Own-site canonical blog.** Publish the series on aistockassist.com (not just Substack) so it
  compounds in search instead of being a one-day firework. (Site is a React SPA today — needs a
  small `/blog` + prerender/SSG build; scope it once the beachhead shows the content converts.)
- **AEO / answer-engine citation.** Structured data (JSON-LD), `llms.txt`, reproducible/"shows its
  work" content — answer engines favor citable, structured facts. Get cited by ChatGPT / Perplexity /
  Gemini for ticker + framework queries.
- **Dogfood AEO Analyzers on aistockassist.com** — we own the exact tool for this. Run it, fix the
  gaps it finds. Two of our own apps compounding each other.

### 2b. Product-led loops
- Make the free first run so good it sells itself. Shareable analysis card with a subtle
  "analyzed with AI Stock Assist" credit → a user's followers (fellow investors) see it in context.
  The **output is the marketing** — the single biggest lever for a tool like this.
- Consider a light referral ("give 3 free analyses, get 3").

### 2c. Directories & Product Hunt
- Execute the existing PH launch playbook; list in AI-tool + investing-tool directories. People
  browsing *for tools* are pre-qualified buyers.

---

## Part 3 — AUTOMATION R&D (future plans — the "different problem")

### LinkedIn (and cross-app) posting automation
- **Reality check:** LinkedIn heavily gates programmatic posting. The official path is the
  Marketing Developer Platform / Posts API, which needs a registered LinkedIn app + OAuth + (often)
  an approval review. **Company Pages are far easier to automate than personal profiles**, which are
  the most restricted. Expect friction; this is genuine R&D, not a weekend script.
- **Near-term without raw API:** scheduling tools (Buffer / Typefully / Publer / Hootsuite) automate
  *timing* and multi-channel fan-out today — 80% of the benefit, none of the approval friction.
- **Cross-app reuse:** whatever we build for Macro Lens's LinkedIn automation should be portable
  across the portfolio (the "fix once, applies to all 12–20 apps" principle). Build it as shared
  infra, not per-app.
- **Status:** parked as future R&D; revisit after the beachhead + long-tail work shows traction.

### Other methods to investigate later
- Newsletter cross-promotion within our own ecosystem (Macro Lens ⇄ AI Stock Assist — macro + micro
  are complementary; the heartbeat blitz already does this).
- Lightweight email capture + re-engagement (a returning user is worth 10 cold impressions).

---

## Part 4 — FOUNDATIONAL (prerequisite for knowing what works)

**Instrument the funnel.** Add Plausible/GA + read the Stripe funnel so we can see
**landing → first analysis → paid** drop-off. Right now we're flying blind on whether this is a
*traffic* problem or a *conversion* problem — and they need opposite fixes. This is the highest-ROI
thing on the list because it makes everything else measurable.

---

## Sequencing (so this isn't boil-the-ocean)

1. **This week:** stand up analytics (Part 4) + start the r/ValueInvesting beachhead (Part 1).
2. **Weeks 2–4:** keep the beachhead warm; scope + prototype the long-tail ticker pages (2a).
3. **Month 2+:** own-site canonical blog + product-share loop + PH; dogfood AEO Analyzers.
4. **Later / R&D:** LinkedIn API automation as shared cross-app infra.

The drumbeat of education continues throughout — just aimed at intent (search, communities),
not sprayed at feeds.
