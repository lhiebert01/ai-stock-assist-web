# Episode 7 — "The Three Apple Stands" · Image Prompt Pack

House style: photorealistic, studio-grade, real people, **f/8 tack-sharp throughout (no bokeh)**, no AI tells. Every prompt self-contains the full style block (image generators have no memory). See `marketing_image_prompt_standards`; Ep 5/6 packs are the template.

Episode 7 needs **3 visuals** — two generated photoreal, one captured/mocked from the app.

| Slot | Canonical file | Status |
|---|---|---|
| Hero / Substack header (parable) | `docs/images/episode-7/Blog-7-hero-apple-stands.png` | ⬜ generate |
| Opening scene (café + spreadsheet) | `docs/images/episode-7/Blog-7-marcus-spreadsheet.png` | ⬜ generate |
| Demo screenshot (Top Pick = CVE) | `docs/images/episode-7/Blog-7-top-pick-screenshot.png` | ⬜ capture from app (preferred) or mock |

---

## 🅐 HERO — "The Three Apple Stands" (Substack header + social promo)

**Overlay at design time:** tagline *"Three apples. Same red. How do you choose?"* + AI Stock Assist diamond watermark, bottom-right. Generate clean (no text).

**Prompt:**

> A warm, rustic country farmers' market at golden hour. Three simple wooden apple stands stand in a row, each with a hand-painted sign — the first reads "BEST," the second "FRESHEST," the third "CHEAPEST." Behind each stand, a weathered farmer. On every stand sits a basket of red apples that look completely identical — same deep red, same shine, same size. In the foreground, a middle-aged working man in a flannel shirt stands holding one apple in each hand, glancing between the three stands with a genuinely puzzled expression — he can't tell them apart. A subtle detail: one half-bruised, mealy apple lies fallen in the dirt beside the "CHEAPEST" stand. Leave clear headroom in the bottom third for a caption overlay.
>
> Real-world editorial photography, studio-grade quality. Shot on a Sony A7R V with a 50mm prime lens at f/8 (environmental scene). Natural golden-hour light. Tack-sharp focus throughout — deep depth of field, every detail crystal-clear from foreground to background. NO blurred backgrounds, NO bokeh — every apple, the wood grain of the stands, the hand-painted signs, every face crisp. Real-people aesthetic — natural skin texture with visible pores, slight asymmetry, real wrinkles, weathered hands, hair flyaways, lived-in clothing. Must look like an actual professional photograph — NOT a 3D render, NOT an AI generation, NOT a painting. Strictly avoid AI tells: no plastic-glossy skin, no perfect symmetry, no glassy eyes, no surreal lighting. Reference style: Steve McCurry / Sebastião Salgado documentary photography; warm autumn russet + amber palette.

---

## 🅑 OPENING SCENE — Marcus and the spreadsheet (café)

**Caption:** *Six hours on a Saturday. By dinner, Marcus still couldn't tell them apart.*

**Prompt:**

> Inside a warm, busy independent coffee shop in morning light. Marcus — a 52-year-old union electrician, salt-and-pepper hair, flannel work shirt, reading glasses, calloused hands — slides his open laptop across a wooden café table toward three friends. The laptop screen shows a neat three-column financial spreadsheet (legible columns of numbers). Across the table: Sarah (28, casual tech-startup style), Elena (24, cardigan, latte), and Alex (calm, attentive). Marcus wears a slightly frustrated, determined expression — proud of his work but stuck. Real café texture: coffee cups with condensation, a notebook, pastry crumbs, steam. Over-the-shoulder framing that keeps all four faces and the laptop screen clearly in frame.
>
> Real-world editorial photography, studio-grade quality. Shot on a Sony A7R V with a 35mm prime lens at f/8 (over-the-shoulder environmental). Natural window light with soft fill. Tack-sharp focus throughout — deep depth of field, every face and the laptop screen crystal-clear from foreground to background. NO blurred background, NO bokeh. Real-people aesthetic — natural skin texture with visible pores, slight asymmetry, real wrinkles, weathered electrician's hands, hair flyaways, lived-in clothing. Must look like an actual professional photograph — NOT a 3D render, NOT an AI generation, NOT a painting. Strictly avoid AI tells: no plastic-glossy skin, no perfectly symmetrical faces, no glassy uncanny-valley eyes. Reference style: Joe McNally environmental portraits / Annie Leibovitz group framing.

---

## 🅒 DEMO SCREENSHOT — Top Pick = CVE

**Preferred: capture the real screenshot.** You already ran `CVE BKR AA` (and the full 10-ticker set) on June 9 — re-run just `CVE BKR AA`, screenshot the **"Our Top Pick: CVE"** banner + the comparison row showing **OCF/NI** (CVE 2.31x vs AA 0.83x), crop clean, save as `Blog-7-top-pick-screenshot.png`. Real product = most credible.

**If generating a mockup instead** (clean graphic-design style, NOT photoreal — verify the text/numbers render correctly):

> A clean, modern fintech-app UI card on a dark charcoal background (#0f172a). A gold/amber banner at top reads **"🏆 Our Top Pick: CVE · Growth & Quality."** Below it, a compact 3-row comparison table with columns "Ticker", "P/E", "OCF/NI", "FCF Yield", "Verdict":
> Row 1 — **CVE · 15.96x · 2.31x · 6.85% · BUY** (highlighted with a soft green glow as the winner).
> Row 2 — BKR · 20.72x · 1.37x · 4.90% · BUY.
> Row 3 — AA · 18.83x · **0.83x** (the OCF/NI cell flagged amber/red) · 5.61% · BUY.
> A muted caption line below: "Same valuation band — opposite cash quality. OCF/NI is the tiebreaker."
> Teal accent (#2dd4bf) for the title; rounded corners, generous padding, crisp legible sans-serif (Inter / SF Pro).
>
> Clean modern editorial product-UI mockup in the Visual Capitalist / Bloomberg Terminal / Stripe-dashboard aesthetic. Flat, high-contrast, pixel-crisp — NOT a photograph, NOT a 3D render, NOT a painting. Perfectly legible text with accurate spelling of every label and number, sharp vector-clean edges, dark-mode fintech dashboard look. No skeuomorphism, no drop-shadow clutter, no lens blur.

**After generating, verify** every number rendered correctly (15.96x, 2.31x, 0.83x, etc.) — gens often mangle digits. If off, use the real screenshot or fix the text in Canva/Figma.

---

## Data lock (real, as of June 9 2026 — illustrative, not advice)

| | P/E | OCF/NI | FCF Yield | ROE | Verdict |
|---|---|---|---|---|---|
| CVE (Cenovus) | 15.96x | 2.31x | 6.85% | 14.8% | BUY · Top Pick |
| BKR (Baker Hughes) | 20.72x | 1.37x | 4.90% | 17.2% | BUY |
| AA (Alcoa) | 18.83x | 0.83x ⚠ | 5.61% | 15.4% | BUY |

Lesson hinges on **cash-flow quality (OCF/NI)**, not future returns — durable.
