/**
 * METRICS DICTIONARY — the single source of truth (WO-ASA-006.1).
 *
 * Every metric name, formula, tier band, pro tip, checklist threshold, and
 * framework binding lives HERE and only here. The sidebar (MetricsGlossary),
 * the Learn-page guide (MetricsGuide), and — when they ship — compare mode
 * and card tooltips all render FROM this file. Re-typed facts drift; bound
 * facts can't. scripts/check-metrics-drift.mjs fails the build if a tier
 * literal reappears in a surface component.
 *
 * Engine-side counterpart: GQ_THRESHOLDS in ai-stock-render/api/lib/verdict.py
 * (scorer + near-miss + What-Would-Change). The framework bindings below
 * must match it; the framework check thresholds are restated here for
 * display only.
 *
 * ── 006.2 RECONCILIATION CANON (owner sign-off Jul 9 2026) ──────────
 * Conflicts between the old sidebar and the full guide resolved as follows
 * (full guide wins — it was the reviewed WO-ASA-002.7 copy):
 *  - P/FCF tiers: guide (<15 / 15–25 / >35) + framework-scores-at-<20x note
 *  - P/B tiers: guide (<1.5 / 1.5–5.0 / >10)
 *  - D/E tiers: guide (<0.5 / 0.5–1.0 / >2.0); ratio-vs-% display = 002.5
 *  - Current Ratio: guide (>2.0 / 1.5–2.0 / <1.0 risky)
 *  - Quick Ratio formula: guide — (Current Assets − Inventory) / CL
 *  - Checklist D/E: guide (<1.0 must-have; >3.0 critical flag)
 *  - Dividend yield red tier: ">8% — possible yield trap" (0% is a style,
 *    not a flag)
 *  - Payout Ratio ADDED to the sidebar (the "is the dividend safe" check)
 */

export const DEFINITIONS_VERSION = 'v1.2';

export type TierColor = 'green' | 'yellow' | 'red';
export interface MetricTier {
  color: TierColor;
  text: string;
}
export interface MetricDef {
  id: string;
  name: string;
  /** Compact name for the sidebar (defaults to name). */
  shortName?: string;
  formula?: string;
  /** Compact one-liner (sidebar). */
  oneLiner: string;
  /** Full interpretation (guide). */
  interpretation: string;
  tiers: MetricTier[];
  proTip?: string;
  /** Which framework check consumes it (display copy). */
  framework?: string;
  section: 'valuation' | 'cashflow' | 'profitability' | 'balance' | 'timing';
}

export const METRICS: MetricDef[] = [
  // ── Price & Valuation ─────────────────────────────────────────────
  {
    id: 'pe', name: 'P/E Ratio (Price-to-Earnings)', shortName: 'P/E Ratio',
    formula: 'Stock Price / Earnings Per Share', section: 'valuation',
    oneLiner: 'How much you pay per dollar of earnings. Lower = cheaper.',
    interpretation: 'How much you pay per dollar of earnings. Lower = cheaper. S&P 500 average is ~20-22. Tech/growth companies normally trade at 25-40+.',
    tiers: [
      { color: 'green', text: '< 15 Excellent' },
      { color: 'yellow', text: '15–25 Fair' },
      { color: 'red', text: '> 35 Expensive' },
    ],
    proTip: "Compare to industry average AND the company's own historical P/E, not just absolute numbers.",
    framework: 'Graham ✓ (P/E < 15 check) · G&Q context',
  },
  {
    id: 'pb', name: 'P/B Ratio (Price-to-Book)', shortName: 'P/B Ratio',
    formula: "Market Cap / Shareholders' Equity", section: 'valuation',
    oneLiner: 'Price vs. net asset value. Under 1.5 = potential bargain.',
    interpretation: "Compares stock price to the company's actual net asset value. Below 1.0 means you're buying assets for less than they're worth on paper. Warren Buffett looks for P/B < 1.5.",
    tiers: [
      { color: 'green', text: '< 1.5 Bargain' },
      { color: 'yellow', text: '1.5–5.0 Fair' },
      { color: 'red', text: '> 10 Very Expensive' },
    ],
    proTip: "P/B < 0.5 may indicate bankruptcy risk, not a bargain. Always check WHY it's cheap.",
    framework: 'Graham ✓ (P/B < 1.5 check) · G&Q context',
  },
  {
    id: 'pfcf', name: 'P/FCF Ratio (Price-to-Free Cash Flow)', shortName: 'P/FCF Ratio',
    formula: 'Market Cap / Free Cash Flow', section: 'valuation',
    oneLiner: 'How much you pay per dollar of real cash. Lower = better.',
    interpretation: "How much you pay per dollar of real cash. More reliable than P/E because cash can't be manipulated like accounting earnings. Warren Buffett's preferred metric. Our framework's own line is stricter than the general guidance: under 20x counts as 'cheap' for scoring. See How Verdicts Are Scored.",
    tiers: [
      { color: 'green', text: '< 15 Excellent' },
      { color: 'yellow', text: '15–25 Good' },
      { color: 'red', text: '> 35 Expensive' },
    ],
    proTip: "If P/FCF is much higher than P/E, that's an accounting red flag — earnings may be inflated.",
    framework: 'G&Q ✓ (< 20x scores full credit)',
  },
  {
    id: 'mcap', name: 'Market Capitalization', shortName: 'Market Cap',
    formula: 'Current Price x Shares Outstanding', section: 'valuation',
    oneLiner: 'Total value of all shares. Mega (>$200B), Large, Mid, Small, Micro.',
    interpretation: 'Total value of all shares. Mega/Large = more stable. Small/Micro = more growth potential but riskier. Large Cap: $10B-$200B. Small Cap: $300M-$2B.',
    tiers: [
      { color: 'green', text: 'Mega >$200B' },
      { color: 'yellow', text: 'Mid $2B–$10B' },
      { color: 'red', text: 'Micro <$300M' },
    ],
    framework: 'Graham ✓ (size ≥ $2B check)',
  },
  {
    id: 'range52w', name: '52-Week High / Low', shortName: '52-Week Range', section: 'valuation',
    oneLiner: 'Highest and lowest price in the past year. Shows volatility.',
    interpretation: 'Highest and lowest price in the past year. Shows volatility and where the stock sits in its range. Calculate: (Current - Low) / (High - Low) x 100 to get range position.',
    tiers: [
      { color: 'green', text: 'Near low = potential value' },
      { color: 'yellow', text: 'Mid-range' },
      { color: 'red', text: 'Near high = expensive?' },
    ],
    proTip: 'New 52-week lows may indicate real problems, not just a bargain. Always investigate why.',
    framework: 'context-only',
  },
  {
    id: 'divyield', name: 'Dividend Yield',
    formula: 'Annual Dividend / Current Price x 100', section: 'valuation',
    oneLiner: 'Cash returned to shareholders yearly as a percentage of price.',
    interpretation: 'Cash returned to shareholders yearly as a percentage of price. Utilities/REITs typically pay 3-6%. Tech companies often pay 0-2%, preferring stock buybacks.',
    tiers: [
      { color: 'green', text: '> 2% Good income' },
      { color: 'yellow', text: '1–2% Modest' },
      { color: 'red', text: '> 8% — possible yield trap' },
    ],
    proTip: 'High yield + declining stock price often signals a coming dividend cut. Check if FCF covers the dividend. Paying nothing is a style choice, not a warning sign.',
    framework: 'Graham ✓ (dividend record check)',
  },
  {
    id: 'payout', name: 'Payout Ratio',
    formula: 'Annual Dividends / Net Income x 100', section: 'valuation',
    oneLiner: "The 'is this dividend safe?' check. Below 60% = room to keep paying.",
    interpretation: "What share of profit a company pays out as dividends. Below 60% = plenty of room to keep paying and grow. Above 100% = paying out more than they earn (borrowing the difference) — a dividend cut is usually coming. The single best 'is this dividend safe?' check.",
    tiers: [
      { color: 'green', text: '< 60% Sustainable' },
      { color: 'yellow', text: '60–100% Watch carefully' },
      { color: 'red', text: '> 100% Borrowing to pay' },
    ],
    proTip: "Pair with Dividend Yield. A high yield + high payout ratio is the classic 'yield trap' (think 12% yield with 162% payout — unsustainable). A modest 3% yield with 44% payout is what J&J pays — and what compounds for decades.",
    framework: 'context-only',
  },
  // ── Cash Flow ─────────────────────────────────────────────────────
  {
    id: 'fcf', name: 'Free Cash Flow (FCF)',
    formula: 'Operating Cash Flow - Capital Expenditures', section: 'cashflow',
    oneLiner: 'Cash left after running the business. The truest measure of profitability.',
    interpretation: 'The cash left after running the business. The truest measure of profitability. This is the cash available to pay dividends, buy back stock, pay down debt, or fund growth without borrowing.',
    tiers: [
      { color: 'green', text: 'Positive & growing' },
      { color: 'red', text: 'Negative or declining' },
    ],
    proTip: 'Negative FCF is OK for early-stage growth companies investing heavily. For mature companies, it\'s a red flag. Right now, watch Capex/OCF for big tech: many are spending half or more of their operating cash on AI infrastructure — the card\'s bridge line shows the split so you can judge which it is.',
    framework: 'feeds FCF Yield & P/FCF checks',
  },
  {
    id: 'fcfyield', name: 'FCF Yield',
    formula: '(Free Cash Flow / Market Cap) x 100', section: 'cashflow',
    oneLiner: 'Cash return on the stock price. Higher = more cash per dollar invested.',
    interpretation: "Cash return on the stock price. A 6% FCF Yield means you're getting 6% of your investment back in cash each year. Compare to the current 10-year Treasury yield — if FCF Yield > 5%, the stock may be undervalued.",
    tiers: [
      { color: 'green', text: '> 5% Very good' },
      { color: 'yellow', text: '3–5% Good' },
      { color: 'red', text: '< 0% Burning cash' },
    ],
    proTip: '> 8% FCF Yield is excellent — better than most bonds! This is what value investors hunt for.',
    framework: 'G&Q ✓ (≥ 5% scores full credit)',
  },
  {
    id: 'ocf', name: 'Operating Cash Flow (OCF)', section: 'cashflow',
    oneLiner: 'Cash generated from core business operations, before capital spending.',
    interpretation: 'Cash generated from core business operations, before capital spending. Should be positive and ideally larger than Net Income (this is the quality check). Consistent growth = healthy business model.',
    tiers: [
      { color: 'green', text: 'Positive & growing' },
      { color: 'red', text: 'Negative' },
    ],
    framework: 'feeds OCF/NI check',
  },
  {
    id: 'ocfni', name: 'OCF/Net Income Ratio', shortName: 'OCF/NI Ratio',
    formula: 'Operating Cash Flow / Net Income', section: 'cashflow',
    oneLiner: 'Earnings quality check. Below 1.0 = profits not arriving as cash.',
    interpretation: "THE critical red flag check. Cash cannot be faked, but earnings can be manipulated. Below 1.0 means the company is reporting profits it's NOT collecting in cash. Enron and WorldCom both had OCF/NI < 1.0 before their collapse.",
    tiers: [
      { color: 'green', text: '> 1.0 Quality earnings' },
      { color: 'yellow', text: '0.8–1.0 Caution' },
      { color: 'red', text: '< 0.8 RED FLAG' },
    ],
    proTip: 'This metric is non-negotiable. If consistently < 1.0, investigate: aggressive revenue recognition? Customers not paying? Potential fraud?',
    framework: 'G&Q ✓ (≥ 1.0 scores full credit)',
  },
  // ── Profitability ─────────────────────────────────────────────────
  {
    id: 'roe', name: 'Return on Equity (ROE)',
    formula: "Net Income / Shareholders' Equity", section: 'profitability',
    oneLiner: 'How efficiently the company turns shareholder money into profit.',
    interpretation: 'How efficiently the company uses shareholder money to generate profit. Above 20% is best-in-class. Tech companies typically 15-30%, banks 10-15%, utilities 8-12%.',
    tiers: [
      { color: 'green', text: '> 15% Good' },
      { color: 'yellow', text: '10–15% Average' },
      { color: 'red', text: '< 10% Poor' },
    ],
    proTip: "Warren Buffett's rule: Look for ROE > 15% consistently over multiple years, not just one good quarter. One more rule: very high ROE (50%+) is usually a leverage artifact, not a talent signal — debt shrinks the equity denominator and inflates the ratio. Check Debt/Equity next, and prefer ROIC, which can't be flattered by borrowing.",
    framework: 'G&Q ✓ (> 15% scores full credit)',
  },
  {
    id: 'margin', name: 'Profit Margin',
    formula: '(Net Income / Revenue) x 100', section: 'profitability',
    oneLiner: 'How much of each revenue dollar becomes profit. Higher = pricing power.',
    interpretation: 'How much of each revenue dollar becomes profit. Higher margins = pricing power and operational efficiency. Software/Tech: 15-30% typical. Retail: 2-5%. Above 20% is excellent.',
    tiers: [
      { color: 'green', text: '> 10% Pricing power' },
      { color: 'yellow', text: '5–10% Fair' },
      { color: 'red', text: '< 5% Thin margins' },
    ],
    framework: 'G&Q ✓ (> 10% scores full credit)',
  },
  // ── Balance Sheet ─────────────────────────────────────────────────
  {
    id: 'health', name: 'Balance Sheet Health Score (0-100)', shortName: 'Health Score', section: 'balance',
    oneLiner: 'Composite of Debt/Equity, Current Ratio, and Quick Ratio.',
    interpretation: 'Our composite score based on Debt/Equity (35 pts), Current Ratio (35 pts), and Quick Ratio (30 pts). Quick way to assess financial stability and bankruptcy risk.',
    tiers: [
      { color: 'green', text: '80-100 (A) Excellent' },
      { color: 'yellow', text: '50-69 (C+/B) Fair' },
      { color: 'red', text: '< 40 (D) Weak' },
    ],
    framework: 'G&Q ✓ (≥ 70 scores full credit)',
  },
  {
    id: 'de', name: 'Debt-to-Equity Ratio', shortName: 'Debt-to-Equity',
    formula: 'Total Debt / Total Equity', section: 'balance',
    oneLiner: 'How leveraged the company is. Lower = safer.',
    interpretation: 'How leveraged the company is. Lower = safer. Software/Tech: 0.0-0.5 typical. Utilities/REITs: 1.0-2.0 typical (capital intensive). Rising debt + falling revenue = danger.',
    tiers: [
      { color: 'green', text: '< 0.5x Low debt' },
      { color: 'yellow', text: '0.5–1.0x Moderate' },
      { color: 'red', text: '> 2.0x High risk' },
    ],
    proTip: 'Shown everywhere as a ratio with an "x" (1.32x means the company owes $1.32 of debt per $1 of equity). Compare within a sector — utilities and REITs carry more debt by nature than software. This is a general guide; D/E feeds the Health Score rather than scoring directly.',
    framework: 'feeds Health Score (general guide)',
  },
  {
    id: 'current', name: 'Current Ratio',
    formula: 'Current Assets / Current Liabilities', section: 'balance',
    oneLiner: 'Can the company pay its bills this year? Above 2 = comfortable.',
    interpretation: 'Can the company pay its short-term bills? Above 2 means they have $2 in assets for every $1 of short-term debt. Below 1.0 for extended periods = liquidity crisis risk.',
    tiers: [
      { color: 'green', text: '> 2.0 Strong' },
      { color: 'yellow', text: '1.5–2.0 Good' },
      { color: 'red', text: '< 1.0 Risky' },
    ],
    framework: 'Graham ✓ (≥ 2.0 check) · feeds Health Score',
  },
  {
    id: 'quick', name: 'Quick Ratio (Acid Test)', shortName: 'Quick Ratio',
    formula: '(Current Assets - Inventory) / Current Liabilities', section: 'balance',
    oneLiner: 'Like current ratio but excludes inventory. Stricter liquidity test.',
    interpretation: 'Like Current Ratio but stricter — excludes inventory (which might not sell quickly). More conservative measure of liquidity. If both ratios are healthy, the company is in great shape.',
    tiers: [
      { color: 'green', text: '> 1.0 Good' },
      { color: 'yellow', text: '0.5–1.0 Fair' },
      { color: 'red', text: '< 0.5 Poor' },
    ],
    framework: 'feeds Health Score',
  },

  // ── Timing Signals (WO-ASA-TIMING-COPY Rev B) ─────────────────────
  {
    id: 'timing-overview', name: 'Timing Signals (BETA)', shortName: 'Timing', section: 'timing',
    oneLiner: 'A separate "when" read shown beside the verdict — it may agree or disagree.',
    interpretation: 'Timing describes named signals and their evidence — not advice, not a prediction. The verdict answers what and why; timing describes when. Signals still being tested carry a BETA badge while the validation study is in progress. Signals we cannot yet compute for a stock are hidden, and a footnote shows how many of five are being checked.',
    tiers: [
      { color: 'green', text: 'No warning signs' },
      { color: 'yellow', text: 'Several warning signs on' },
      { color: 'green', text: 'Entry conditions aligned' },
    ],
    framework: 'Timing · beta',
  },
  {
    id: 'better-price-range', name: 'Better-price range', section: 'timing',
    oneLiner: 'The price band the framework treats as a more constructive place to enter.',
    interpretation: "A range around the stock's recent typical price. When today's price sits above the top of the range, the stock is extended and a lower entry may become available if it returns to the range. Shown in dollars with a marker for the current price.",
    tiers: [
      { color: 'green', text: 'In or below the range' },
      { color: 'yellow', text: 'Above the range (extended)' },
    ],
    framework: 'Timing',
  },
  {
    id: 'tracking-anchor', name: 'Tracking starting point', section: 'timing',
    oneLiner: "One click marks today's price as your starting point — no typing.",
    interpretation: 'From your start, we show how the stock trades versus the average price paid since then, weighted by trading volume. This is a volume-weighted average of prices since your start — not a 50-day average, and not a statement of over- or under-valuation. Reset anytime: Stop, then Begin again.',
    tiers: [
      { color: 'green', text: 'Holding above your starting point' },
      { color: 'yellow', text: 'Below your starting point' },
    ],
    framework: 'Timing',
  },
  {
    id: 'timing-bargain', name: 'Still a bargain / No longer a bargain', section: 'timing',
    oneLiner: 'Whether price has caught up to what the framework estimates the business is worth.',
    interpretation: "Green when a margin of safety remains; amber when price is at or above the framework's estimate of fair value (shown as a percentage of that estimate).",
    tiers: [
      { color: 'green', text: 'Still a bargain' },
      { color: 'yellow', text: 'No longer a bargain' },
    ],
    framework: 'Timing · exit signal',
  },
  {
    id: 'timing-trend', name: 'Long-term trend', section: 'timing',
    oneLiner: 'Whether the stock is above its long-term average and keeping pace with the market.',
    interpretation: 'Green when the trend is healthy; amber on a downtrend — below its long-term average and losing ground against the market.',
    tiers: [
      { color: 'green', text: 'Long-term trend healthy' },
      { color: 'yellow', text: 'Downtrend' },
    ],
    framework: 'Timing',
  },
  {
    id: 'timing-rated', name: 'Rated attractive', section: 'timing',
    oneLiner: 'Whether the framework currently rates the stock attractive.',
    interpretation: "A green light for entry when the framework's rating is attractive; otherwise it shows the current rating.",
    tiers: [
      { color: 'green', text: 'Rated attractive' },
      { color: 'yellow', text: 'Not currently attractive' },
    ],
    framework: 'Timing · entry signal',
  },
  {
    id: 'timing-overstretched', name: 'Price not overstretched', section: 'timing',
    oneLiner: 'Whether price is near its typical recent level rather than stretched above it.',
    interpretation: 'A green light when price is near its typical recent level (roughly within five percent of its 50-day average); amber when stretched above its usual level.',
    tiers: [
      { color: 'green', text: 'Not overstretched' },
      { color: 'yellow', text: 'Stretched above usual' },
    ],
    framework: 'Timing · entry signal',
  },
];

export const SECTIONS: { id: MetricDef['section']; title: string; emoji: string; chip: string }[] = [
  { id: 'valuation', title: 'Price & Valuation Metrics', emoji: '1️⃣', chip: 'P/FCF under 20x counts toward the score. P/E and P/B are context, not score inputs.' },
  { id: 'cashflow', title: 'Cash Flow Metrics', emoji: '2️⃣', chip: 'FCF yield ≥ 5% and OCF/NI ≥ 1.0 — two of the six points live here. Cash is the heart of this framework.' },
  { id: 'profitability', title: 'Profitability & Efficiency', emoji: '3️⃣', chip: 'ROE > 15% and profit margin > 10%. High ROE next to high debt gets flagged, not celebrated.' },
  { id: 'balance', title: 'Balance Sheet Health', emoji: '4️⃣', chip: 'Health score ≥ 70 of 100. This is the check most otherwise-strong stocks fail.' },
  { id: 'timing', title: 'Timing Signals', emoji: '⏱️', chip: 'A separate "when" read beside the verdict (BETA). State-dependent titles; jargon lives in tooltips; signals not yet computable are hidden.' },
];

/** "Two Lenses" header (sidebar + tooltip surfaces). */
export const TWO_LENSES = [
  { name: 'Growth & Quality', body: 'Six checks on cash, earnings honesty, profitability, balance sheet. 0–6 score: BUY ≥ 4.5 · HOLD ≥ 3.0 · below = SELL.' },
  { name: 'Graham Classic', body: "Benjamin Graham's 1949 criteria, unmodified. A strict historical lens; a useful sparring partner for any modern verdict." },
];

/** "Choosing a Lens" — single source for the framework-picker ⓘ panel AND the
 * guide section (WO-ASA-FRAMEWORK-PICKER). Names are canon and unchanged;
 * "(Recommended)" is a product default, not advice. */
export const CHOOSING_A_LENS = {
  title: 'Not sure which framework to use?',
  sublabels: {
    'Growth & Quality': '(Recommended)',
    'Graham Value Investing': '(Strict 1949 deep-value method)',
  } as Record<string, string>,
  recommendation:
    'Most people should start with Growth & Quality. If you specifically want ' +
    "Benjamin Graham's strict 1949 deep-value test, choose Graham Classic.",
  lenses: [
    {
      name: 'Growth & Quality',
      question: 'Is this a well-run business generating real cash at a sane price today?',
      detail:
        'Six checks — cash yield, price vs. cash, earnings honesty, balance-sheet ' +
        'strength, returns, margins — scored 0–6; BUY ≥ 4.5.',
    },
    {
      name: 'Graham Classic',
      question: "Is this statistically cheap by Graham's unmodified 1949 standards?",
      detail:
        'Thresholds so strict most modern companies fail them. That’s the point: it ' +
        'shows what "cheap" meant when value investing was invented, and makes a useful ' +
        'sparring partner for any modern verdict.',
    },
  ],
  bothProduce:
    'Both produce the same outputs: a BUY/HOLD/SELL verdict, a score, key strengths ' +
    'and risks, and the "what would change this verdict" arithmetic. Different question, ' +
    'same evidence card — and when the two disagree on a stock, the card says so.',
  honestNote:
    'One honest note: neither framework scores growth. Revenue and earnings growth ' +
    'appear on every card as context, but they don’t feed either score — so a fast-' +
    'growing stock can rate HOLD or SELL here while the market loves it. A growth-focused ' +
    'lens is on our roadmap.',
  footerLinkText: 'Full comparison → Metrics Guide: Choosing a Lens',
  footerLinkHref: '/?view=metrics#choosing-a-lens',
};

/** "Reading the Card" micro-entries (sidebar; the guide has the full section). */
export const READING_THE_CARD_MICRO = [
  { title: '"Data as of"', body: 'One card, one clock: every number on a card comes from the same period, converted to one currency.' },
  { title: 'n/m', body: 'When a ratio would lie (e.g. P/FCF on negative cash flow), the card says "n/m" with the reason instead of a meaningless number.' },
];

/** Screening checklist — rendered from here on every surface. */
export const CHECKLIST = {
  quality: [
    'OCF/Net Income ≥ 1.0 (cash quality check)',
    'Debt/Equity < 1.0 (manageable debt)',
    'Current Ratio > 1.5 (can pay bills)',
    'Health Score > 70 (B+ or better)',
    'ROE > 15% (efficient capital use)',
    'Profit Margin > 10% (pricing power)',
    'Positive Free Cash Flow (generating cash)',
  ],
  redFlags: [
    'OCF/NI < 0.8 — possible accounting manipulation',
    'Debt/Equity > 3.0 — dangerously overleveraged',
    'Current Ratio < 1.0 — liquidity crisis risk',
    'Negative FCF for 3+ years (mature company)',
    'Health Score < 40 (D grade)',
    'Payout Ratio > 100% — borrowing to pay dividends',
    'Dividend yield > 8% with Payout Ratio > 80% — yield trap',
  ],
  warnings: [
    'ROE < 10% — inefficient business',
    'Declining revenue for 2+ years',
    'P/E > 50 with slowing growth',
  ],
  canonicalLine: 'OCF/NI below 1.0 means stop and ask why.',
};
