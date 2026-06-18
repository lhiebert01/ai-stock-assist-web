# CLAUDE — Blog / Marketing Publish-Kit Guide

**Read this before drafting the deliverable for ANY long-form article we publish** (Intelligence Era episodes, standalone blogs, marketing articles). It encodes the format Lindsay wants every time, so we stop re-deriving it. Pair with the related memories noted inline.

The deliverable is always **ONE self-contained, cut-and-paste-ready Word publish kit** (`.docx`): the formatted article **+** a clearly-marked PUBLISHING KIT appendix. Generate it from a `...-PUBLISH-READY.md` source via the `build_blog()` pattern in the doc generator (see §6).

---

## 1. The article (Substack/Medium-ready)

- **Title + subtitle**, then the **HERO image first, directly under the subtitle** (`feedback_substack_hero_placement`).
- **Paste-safe formatting** (`feedback_paste_safe_formatting`): flush-left, `•` Unicode bullets, **no** `>` blockquotes, **no** leading spaces/tabs, **no** ASCII boxes.
- **Inline image meta at EVERY image placement** (this is required — see §2).
- **Print the full URL beneath each linked item** (Catch Up list, Try the Tool, Connect) — links strip on paste (`feedback_substack_link_reentry`).
- **End with the native Subscribe button** widget.
- Include the full series spine: Story So Far → parable → demo → objection → 💰 THE MATH → lesson → Try This Yourself → One Ask Before You Go → Next Week → The Intelligence Era Principle → Metric Spotlight → Catch Up on the Series → Try the Tool → Connect → bio (`marketing_published_voice`). Close with the 5-beat value close (`feedback_episode_closing_formula`).
- **Verify the metric loop first**: the spotlighted metric must already exist in `stock_analysis.py`, `stock.ts`, `StockCard.tsx`, AND `MetricsGuide.tsx`. If missing anywhere, add it before publishing.

## 2. Inline image meta block (at each image's spot in the article)

Every image gets a 📷 block right where it belongs, so the kit is paste-and-go:

```
📷 IMAGE N of M — SLOT NAME (where to place it)
File to upload: docs/images/episode-NN/Blog-NN-...png
Caption: <the caption text>
Alt text: <descriptive alt text — accessibility AND SEO>
```

Add a **one-time how-to note** in the PUBLISH NOTES at top: Substack = insert image → click it → type Caption + click "ALT"; Medium = caption field appears below + click the "Alt" badge.

## 3. PUBLISHING KIT appendix — REQUIRED STRUCTURE

Mark it clearly "not part of the article." Then:

### 3a. Tags & Hashtags
- **Substack topics** — no limit; lead with the most specific, episode-distinctive tags, then broaden.
- **Medium tags** — exactly **5**, canonical: Data Science, Investing, Stock Market, Finance, Artificial Intelligence (`reference_medium_tags`).
- **Social hashtags** per platform.

### 3b. CHANNEL POSTS — one self-contained block PER PLATFORM ⭐
**This is the format Lindsay requires (locked 2026-06-18).** Each platform is its own heading, with EXACTLY these three labeled steps **in this order**, inline, so there is no flipping between sections:

```
════════ LINKEDIN ════════

▸ (1) THE POST  (length note; where the article link goes):
<ready-to-paste body>

▸ (2) IMAGE TO ATTACH:  <canonical filename>  (aspect ratio / why)
Alt: <alternate file>.  Folder: docs/images/episode-NN/

▸ (3) FIRST COMMENT  (post immediately after):
<funnel comment — tool link + series catch-up link>
```

Repeat for **FACEBOOK**, **X / TWITTER** (+ an "▸ OPTIONAL — 2-TWEET VERSION"), and **REDDIT**. Do NOT split posts, images, and first comments into separate sections — they must be grouped per platform.

Per-platform conventions:
- **LinkedIn / Facebook**: link in the post body OR first comment (confirm per round — `feedback_link_placement`). First comment drives the tool (`aistockassist.com`) + the series catch-up link (`aistockassist.com/?view=learn`).
- **X (Lindsay is X Premium)**: ONE consolidated single post — hook + lesson + tool CTA + link(s) + hashtags all in one post. NO thread, NO separate first comment, NO 2-tweet version (`feedback_x_thread_length`).
- **Reddit**: honest discussion-first, **NO fabricated "a friend" anecdote**, **NO link / NO product mention**, no image; first comment = none, reply in your own voice (`feedback_reddit_posting_style`).

### 3c. IMAGE ASSETS (reference, at the bottom)
- **"WHICH IMAGE TO USE PER PLATFORM"** map (hero/attached image for Substack, Medium, LinkedIn, Facebook, X).
- Full list: canonical files, the social promo card, the OG crop, and alternates.

## 4. Images (see `marketing_image_prompt_standards`)

- **Every prompt is ONE complete copy-paste block** with the scene + full photorealism style + **output dimensions baked in** (gens default to square 1:1 — always force landscape).
- **Generate at 1600×900 (16:9)**, min 1456px wide. Then export:
  - **1200×630 OG crop** (`...-OG-1200x630.jpg`) for link unfurls.
  - **Promo card 1.91:1** with the headline baked in (e.g. `Blog-NN-promo-linkedin-fb.png`) for the LinkedIn/Facebook feed.
- **Sizing per platform**: Substack header + Medium featured = 16:9 hero; LinkedIn/Facebook = 1.91:1 promo card (or OG crop); X = 16:9 hero.
- Captions/overlays/watermarks are added at **design time**, never baked into the generated photo.
- Save canonical names in `docs/images/episode-NN/`; keep alternates with `-alt-*` suffixes.

## 5. POST-PUBLISH QA (do EVERY time, BOTH Substack and Medium)
Pasting strips links and can duplicate captions. After publishing, verify in the LIVE post (`feedback_substack_link_reentry`):
1. "Catch Up on the Series" titles are actually **hyperlinked** (re-add with Cmd/Ctrl+K).
2. "Connect → Substack" line has its **URL** (often pastes as a bare label).
3. Body CTA URLs (aistockassist.com) are **clickable**.
4. Image **captions kept their opening quote mark**.
5. **Medium only** — captions didn't get duplicated into a body line under the image.

**Substack slug warning**: the slug is derived from the title and varies (Ep 8 → `/p/the-sealed-envelope`, not `/p/episode-8-...`). Don't hardcode a predicted URL in the LearnPage card or posts — mark it provisional and swap in the real link after publishing.

## 6. Generation
- Source: `docs/blog-episode-NN-...-PUBLISH-READY.md`.
- Generator: `build_blog()` in the doc generator (the `/tmp/gen_docs.py` pattern). It renders the article (Title=H0, sections=H2, 📷 meta blocks, bullets, URLs) and the appendix, mapping `════ PLATFORM ════` → Heading 2 and `▸ (n) LABEL` → bold teal sub-labels.
- Output: `docs/exports/blog-episode-NN-...-PUBLISH-KIT.docx`.
- Also produce `docs/exports/Episode-NN-Image-Prompts-COPY-PASTE.docx` (one-shot prompts in copy-boxes).
- **If the `.docx` won't overwrite, it's open in Word** — ask Lindsay to close it, then regenerate. After regen, tell her to fully close + reopen (Word holds a stale view).

## 7. Webpage + deploy
- Add the episode card to `src/components/LearnPage.tsx` (`blogEpisodes` array): `{ ep, emoji, title, hook, url }`. Mark the URL provisional until the real Substack slug is known.
- Build (`npm run build`) before pushing. Repo auto-deploys on push to `main` (Vercel). `?view=learn` deep-links straight to the Learn page for "catch up" posts.

---

**Reference implementation:** Episode 8 "The Sealed Envelope" — `docs/blog-episode-8-the-sealed-envelope-PUBLISH-READY.md` + `docs/exports/blog-episode-8-the-sealed-envelope-PUBLISH-KIT.docx`. Mirror its structure for every future long-form article.
