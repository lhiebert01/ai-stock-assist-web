import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronDown, CheckCircle2, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface MetricsGuideProps {
  onBack: () => void;
}

function Badge({ color, children }: { color: 'green' | 'yellow' | 'red'; children: React.ReactNode }) {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
}

function MetricCard({ name, formula, benchmarks, interpretation, proTip }: {
  name: string;
  formula?: string;
  benchmarks: { color: 'green' | 'yellow' | 'red'; text: string }[];
  interpretation: string;
  proTip?: string;
}) {
  return (
    <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent)]/20 transition-all">
      <h4 className="text-sm font-bold mb-1">{name}</h4>
      {formula && <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2.5">{formula}</p>}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {benchmarks.map((b, i) => <Badge key={i} color={b.color}>{b.text}</Badge>)}
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{interpretation}</p>
      {proTip && (
        <p className="text-xs text-[var(--color-accent)] mt-2 leading-relaxed">
          <span className="font-bold">Pro tip:</span> {proTip}
        </p>
      )}
    </div>
  );
}

/** SECTION D framework chips (WO-ASA-002.18): one line tying each guide
 * section to what the Growth & Quality framework actually scores. */
function FrameworkChip({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 px-4 py-2.5 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/15 text-xs text-[var(--color-text-secondary)] italic">
      <span className="not-italic font-bold text-[var(--color-accent)]">Framework: </span>
      {children}
    </p>
  );
}

export default function MetricsGuide({ onBack }: MetricsGuideProps) {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-0)]/80 via-transparent to-[var(--color-surface-0)]" />
      </div>

      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)] font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          Complete Reference
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Stock Metrics Guide</h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
          Every metric explained — what it means, how to read it, and what the pros look for.
        </p>
      </motion.div>

      {/* ── SECTION A: intro reframe (WO-ASA-002.18) ── */}
      <div className="max-w-3xl mx-auto mb-12 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold mb-3">Old ideas, today's numbers.</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
          Most of what works in investing was figured out decades ago: pay less than you get, trust cash over
          accounting stories, and don't lend your money to companies drowning in debt. Benjamin Graham wrote that
          down in 1949. The principles still hold. The <em>numbers</em> don't — Graham was screening railroads and
          department stores, not cloud software companies that spend billions on data centers and carry no inventory.
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          This guide does two things. First, it explains every metric in plain English — what it measures, what
          "good" looks like today, and the trap hiding inside each one. Second, it shows you exactly how our
          framework turns those metrics into a verdict, so a BUY, HOLD, or SELL is never a mystery — you can check
          our math yourself. No finance degree required. No 500-page book. Just the ideas that survived, priced for
          the market you're actually in.
        </p>
      </div>

      {/* Jump to section */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { label: 'Reading the Card', href: '#reading-the-card' },
          { label: 'Price & Valuation', href: '#price-and-valuation' },
          { label: 'Cash Flow', href: '#cash-flow' },
          { label: 'Profitability', href: '#profitability' },
          { label: 'Balance Sheet', href: '#balance-sheet' },
          { label: 'How Verdicts Are Scored', href: '#how-verdicts-are-scored' },
          { label: 'Screening Checklist', href: '#screening-checklist' },
          { label: 'Investment Strategies', href: '#investment-strategies' },
        ].map((s) => (
          <a key={s.label} href={s.href} className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all">
            {s.label}
          </a>
        ))}
      </div>

      {/* ── SECTION C: Reading the Card (WO-ASA-002.18; AEO anchor target) ── */}
      <section id="reading-the-card" className="mb-16">
        <h2 className="text-xl font-bold mb-3">Reading the Card</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-3xl">
          A few things appear on every analysis card that most stock sites don't show. Each one exists because of a
          real way numbers can quietly lie.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '"Data as of" stamp',
              body: 'Every card shows one date and one period (usually TTM — the trailing twelve months). Every number on that card comes from the same period. That sounds obvious; it isn\'t. Mixing last quarter\'s profit with last year\'s revenue produces ratios that look precise and mean nothing. One card, one clock.',
            },
            {
              title: 'The currency footnote',
              body: 'Foreign companies report in their home currency — Danish kroner, Swiss francs, yen. We convert everything to US dollars at a single dated exchange rate, shown at the bottom of the card. Why it matters: a Danish company\'s "309 billion" in revenue is about $47 billion in dollars. Shown raw, that number would make the stock look six times cheaper than it is. If a card can\'t be converted cleanly, we don\'t show it at all.',
            },
            {
              title: 'n/m — "not meaningful"',
              body: 'Sometimes a ratio isn\'t big or small — it\'s undefined. Example: price-to-free-cash-flow when free cash flow is negative. Dividing a price by a negative number produces something like "−1,070x," which sounds dramatic and means nothing. We print n/m instead, with the reason, and tell you the real story in words (for example: "capex currently exceeds operating cash flow").',
            },
            {
              title: 'NOT RATED',
              body: 'If we can\'t verify a stock\'s numbers — missing data, or figures that contradict each other — the card says NOT RATED and explains why. Missing data is never treated as bad data. A stock we can\'t score is a stock we won\'t score; it will never receive a SELL just because a feed came up empty.',
            },
            {
              title: 'Two views, one stock',
              body: 'Every card shows Wall Street\'s consensus next to our framework\'s verdict. When they disagree sharply, the card says so and explains what each side is weighing. Disagreement isn\'t an error — it\'s information.',
            },
            {
              title: 'The bookmark / Save to Watchlist button',
              body: 'Saves the stock so you can re-run it later at that day\'s prices with one click. Verdicts aren\'t permanent; prices move, quarters get reported, and a HOLD at $367 can be a different proposition at $290.',
            },
          ].map((c) => (
            <div key={c.title} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
              <h4 className="text-sm font-bold mb-2">{c.title}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 1: Price & Valuation ── */}
      <section id="price-and-valuation" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">1️⃣</span> Price & Valuation Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            name="P/E Ratio (Price-to-Earnings)"
            formula="Stock Price / Earnings Per Share"
            benchmarks={[
              { color: 'green', text: '< 15 Excellent' },
              { color: 'yellow', text: '15–25 Fair' },
              { color: 'red', text: '> 35 Expensive' },
            ]}
            interpretation="How much you pay per dollar of earnings. Lower = cheaper. S&P 500 average is ~20-22. Tech/growth companies normally trade at 25-40+."
            proTip="Compare to industry average AND the company's own historical P/E, not just absolute numbers."
          />
          <MetricCard
            name="P/B Ratio (Price-to-Book)"
            formula="Market Cap / Shareholders' Equity"
            benchmarks={[
              { color: 'green', text: '< 1.5 Bargain' },
              { color: 'yellow', text: '1.5–5.0 Fair' },
              { color: 'red', text: '> 10 Very Expensive' },
            ]}
            interpretation="Compares stock price to the company's actual net asset value. Below 1.0 means you're buying assets for less than they're worth on paper. Warren Buffett looks for P/B < 1.5."
            proTip="P/B < 0.5 may indicate bankruptcy risk, not a bargain. Always check WHY it's cheap."
          />
          <MetricCard
            name="P/FCF Ratio (Price-to-Free Cash Flow)"
            formula="Market Cap / Free Cash Flow"
            benchmarks={[
              { color: 'green', text: '< 15 Excellent' },
              { color: 'yellow', text: '15–25 Good' },
              { color: 'red', text: '> 35 Expensive' },
            ]}
            interpretation="How much you pay per dollar of real cash. More reliable than P/E because cash can't be manipulated like accounting earnings. Warren Buffett's preferred metric. Our framework's own line is stricter than the general guidance above: under 20x counts as 'cheap' for scoring, and 5% FCF yield is the 'strong' target. See How Verdicts Are Scored."
            proTip="If P/FCF is much higher than P/E, that's an accounting red flag — earnings may be inflated."
          />
          <MetricCard
            name="Market Capitalization"
            formula="Current Price x Shares Outstanding"
            benchmarks={[
              { color: 'green', text: 'Mega >$200B' },
              { color: 'yellow', text: 'Mid $2B–$10B' },
              { color: 'red', text: 'Micro <$300M' },
            ]}
            interpretation="Total value of all shares. Mega/Large = more stable. Small/Micro = more growth potential but riskier. Large Cap: $10B-$200B. Small Cap: $300M-$2B."
          />
          <MetricCard
            name="52-Week High / Low"
            benchmarks={[
              { color: 'green', text: 'Near low = potential value' },
              { color: 'yellow', text: 'Mid-range' },
              { color: 'red', text: 'Near high = expensive?' },
            ]}
            interpretation="Highest and lowest price in the past year. Shows volatility and where the stock sits in its range. Calculate: (Current - Low) / (High - Low) x 100 to get range position."
            proTip="New 52-week lows may indicate real problems, not just a bargain. Always investigate why."
          />
          <MetricCard
            name="Dividend Yield"
            formula="Annual Dividend / Current Price x 100"
            benchmarks={[
              { color: 'green', text: '> 2% Good income' },
              { color: 'yellow', text: '1–2% Modest' },
              { color: 'red', text: '> 8% Possibly unsustainable' },
            ]}
            interpretation="Cash returned to shareholders yearly as a percentage of price. Utilities/REITs typically pay 3-6%. Tech companies often pay 0-2%, preferring stock buybacks."
            proTip="High yield + declining stock price often signals a coming dividend cut. Check if FCF covers the dividend."
          />
          <MetricCard
            name="Payout Ratio"
            formula="Annual Dividends / Net Income x 100"
            benchmarks={[
              { color: 'green', text: '< 60% Sustainable' },
              { color: 'yellow', text: '60–100% Watch carefully' },
              { color: 'red', text: '> 100% Borrowing to pay' },
            ]}
            interpretation="What share of profit a company pays out as dividends. Below 60% = plenty of room to keep paying and grow. Above 100% = paying out more than they earn (borrowing the difference) — a dividend cut is usually coming. The single best 'is this dividend safe?' check."
            proTip="Pair with Dividend Yield. A high yield + high payout ratio is the classic 'yield trap' (think 12% yield with 162% payout — unsustainable). A modest 3% yield with 44% payout is what J&J pays — and what compounds for decades."
          />
        </div>
        <FrameworkChip>P/FCF under 20x counts toward the score. P/E and P/B are context, not score inputs.</FrameworkChip>
      </section>

      {/* ── Section 2: Cash Flow ── */}
      <section id="cash-flow" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">2️⃣</span> Cash Flow Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            name="Free Cash Flow (FCF)"
            formula="Operating Cash Flow - Capital Expenditures"
            benchmarks={[
              { color: 'green', text: 'Positive & growing' },
              { color: 'red', text: 'Negative or declining' },
            ]}
            interpretation="The cash left after running the business. The truest measure of profitability. This is the cash available to pay dividends, buy back stock, pay down debt, or fund growth without borrowing."
            proTip="Negative FCF is OK for early-stage growth companies investing heavily. For mature companies, it's a red flag. Right now, watch Capex/OCF for big tech: many are spending half or more of their operating cash on AI infrastructure. That suppresses free cash flow without meaning the business is declining — judge which it is before reacting."
          />
          <MetricCard
            name="FCF Yield"
            formula="(Free Cash Flow / Market Cap) x 100"
            benchmarks={[
              { color: 'green', text: '> 5% Very good' },
              { color: 'yellow', text: '3–5% Good' },
              { color: 'red', text: '< 0% Burning cash' },
            ]}
            interpretation="Cash return on the stock price. A 6% FCF Yield means you're getting 6% of your investment back in cash each year. Compare to the current 10-year Treasury yield — if FCF Yield > 5%, the stock may be undervalued."
            proTip="> 8% FCF Yield is excellent — better than most bonds! This is what value investors hunt for."
          />
          <MetricCard
            name="Operating Cash Flow (OCF)"
            benchmarks={[
              { color: 'green', text: 'Positive & growing' },
              { color: 'red', text: 'Negative' },
            ]}
            interpretation="Cash generated from core business operations, before capital spending. Should be positive and ideally larger than Net Income (this is the quality check). Consistent growth = healthy business model."
          />
          <MetricCard
            name="OCF/Net Income Ratio"
            formula="Operating Cash Flow / Net Income"
            benchmarks={[
              { color: 'green', text: '> 1.0 Quality earnings' },
              { color: 'yellow', text: '0.8–1.0 Caution' },
              { color: 'red', text: '< 0.8 RED FLAG' },
            ]}
            interpretation="THE critical red flag check. Cash cannot be faked, but earnings can be manipulated. Below 1.0 means the company is reporting profits it's NOT collecting in cash. Enron and WorldCom both had OCF/NI < 1.0 before their collapse."
            proTip="This metric is non-negotiable. If consistently < 1.0, investigate: aggressive revenue recognition? Customers not paying? Potential fraud?"
          />
        </div>
        <FrameworkChip>FCF yield ≥ 5% and OCF/NI ≥ 1.0 — two of the six points live here. Cash is the heart of this framework.</FrameworkChip>
      </section>

      {/* ── Section 3: Profitability ── */}
      <section id="profitability" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">3️⃣</span> Profitability & Efficiency
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            name="Return on Equity (ROE)"
            formula="Net Income / Shareholders' Equity"
            benchmarks={[
              { color: 'green', text: '> 15% Good' },
              { color: 'yellow', text: '10–15% Average' },
              { color: 'red', text: '< 10% Poor' },
            ]}
            interpretation="How efficiently the company uses shareholder money to generate profit. Above 20% is best-in-class. Tech companies typically 15-30%, banks 10-15%, utilities 8-12%."
            proTip="Warren Buffett's rule: Look for ROE > 15% consistently over multiple years, not just one good quarter. One more rule: very high ROE (50%+) is usually a leverage artifact, not a talent signal. Debt shrinks the equity denominator and inflates the ratio. Check Debt/Equity next — and prefer ROIC, which can't be flattered by borrowing."
          />
          <MetricCard
            name="Profit Margin"
            formula="(Net Income / Revenue) x 100"
            benchmarks={[
              { color: 'green', text: '> 10% Pricing power' },
              { color: 'yellow', text: '5–10% Fair' },
              { color: 'red', text: '< 5% Thin margins' },
            ]}
            interpretation="How much of each revenue dollar becomes profit. Higher margins = pricing power and operational efficiency. Software/Tech: 15-30% typical. Retail: 2-5%. Above 20% is excellent."
          />
        </div>
        <FrameworkChip>ROE &gt; 15% and profit margin &gt; 10%. High ROE next to high debt gets flagged, not celebrated.</FrameworkChip>
      </section>

      {/* ── Section 4: Balance Sheet ── */}
      <section id="balance-sheet" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">4️⃣</span> Balance Sheet Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            name="Balance Sheet Health Score (0-100)"
            benchmarks={[
              { color: 'green', text: '80-100 (A) Excellent' },
              { color: 'yellow', text: '50-69 (C+/B) Fair' },
              { color: 'red', text: '< 40 (D) Weak' },
            ]}
            interpretation="Our composite score based on Debt/Equity (35 pts), Current Ratio (35 pts), and Quick Ratio (30 pts). Quick way to assess financial stability and bankruptcy risk."
          />
          <MetricCard
            name="Debt-to-Equity Ratio"
            formula="Total Debt / Total Equity"
            benchmarks={[
              { color: 'green', text: '< 0.5 Low debt' },
              { color: 'yellow', text: '0.5–1.0 Moderate' },
              { color: 'red', text: '> 2.0 High risk' },
            ]}
            interpretation="How leveraged the company is. Lower = safer. Software/Tech: 0.0-0.5 typical. Utilities/REITs: 1.0-2.0 typical (capital intensive). Rising debt + falling revenue = danger."
            proTip="Note: some analysis cards currently display D/E as a percentage — 623.75 there means 6.24x here. A display update to one convention is in progress."
            /* <!-- REMOVE-WHEN: WO-ASA-002.5 --> the proTip above is temporary until the D/E convention ships */
          />
          <MetricCard
            name="Current Ratio"
            formula="Current Assets / Current Liabilities"
            benchmarks={[
              { color: 'green', text: '> 2.0 Strong' },
              { color: 'yellow', text: '1.5–2.0 Good' },
              { color: 'red', text: '< 1.0 Risky' },
            ]}
            interpretation="Can the company pay its short-term bills? Above 2 means they have $2 in assets for every $1 of short-term debt. Below 1.0 for extended periods = liquidity crisis risk."
          />
          <MetricCard
            name="Quick Ratio (Acid Test)"
            formula="(Current Assets - Inventory) / Current Liabilities"
            benchmarks={[
              { color: 'green', text: '> 1.0 Good' },
              { color: 'yellow', text: '0.5–1.0 Fair' },
              { color: 'red', text: '< 0.5 Poor' },
            ]}
            interpretation="Like Current Ratio but stricter — excludes inventory (which might not sell quickly). More conservative measure of liquidity. If both ratios are healthy, the company is in great shape."
          />
        </div>
        <FrameworkChip>Health score ≥ 70 of 100. This is the check most otherwise-strong stocks fail.</FrameworkChip>
      </section>

      {/* ── SECTION B: How Verdicts Are Scored (WO-ASA-002.18; AEO anchor target) ── */}
      <section id="how-verdicts-are-scored" className="mb-16">
        <h2 className="text-xl font-bold mb-3">How Verdicts Are Scored</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-3xl">
          Every stock you analyze gets a verdict — <strong>BUY</strong>, <strong>HOLD</strong>, or{' '}
          <strong>SELL</strong> — from our Growth &amp; Quality framework. There's no black box. The verdict comes
          from six checks, each pass worth points toward a 6-point score:
        </p>
        <p className="text-sm font-bold font-mono text-center mb-8 px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl max-w-xl mx-auto">
          Score ≥ 4.5 → BUY&nbsp;&nbsp;·&nbsp;&nbsp;Score ≥ 3.0 → HOLD&nbsp;&nbsp;·&nbsp;&nbsp;Below 3.0 → SELL
        </p>
        <h3 className="text-base font-bold mb-4">The six checks, in plain English</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { n: 1, title: 'Free cash flow yield — "How much real cash do I get for my money?"', body: 'FCF Yield ≥ 5% passes. If you paid the full market price for the whole company today, would it hand you back at least 5 cents of spendable cash per dollar, per year? That roughly matches what a safe government bond pays — a stock should clear that bar or have a very good reason.' },
            { n: 2, title: 'Price-to-free-cash-flow — "Am I overpaying for that cash?"', body: 'P/FCF under 20x passes. This is the price tag on each dollar of real cash the business generates. Under 20x, you\'re paying a reasonable multiple. At 60x or 70x, you\'re betting the cash grows into the price.' },
            { n: 3, title: 'Earnings quality (OCF/NI) — "Are the profits real?"', body: 'Operating cash flow ≥ reported profit (a ratio of 1.0 or better) passes. Accounting profit can be dressed up; cash arriving in the bank cannot. When a company reports profits it isn\'t collecting in cash, we want to know why before you do anything else.' },
            { n: 4, title: 'Balance-sheet health — "Can this company survive a bad year?"', body: 'Our 0–100 health score at 70 or above passes. It blends debt load, and two ways of asking "can they pay this month\'s bills." A great business with a fragile balance sheet is a great business someone else may end up owning.' },
            { n: 5, title: 'Return on equity — "Does management turn your money into profit?"', body: 'ROE above 15% passes. (One caution: very high ROE — think 50%+ — is often a debt trick, not a skill signal. Debt shrinks the equity base, which inflates the ratio. We flag those cases; see the ROE card.)' },
            { n: 6, title: 'Profit margin — "Does the business keep what it earns?"', body: 'Margin above 10% passes. It means the company has pricing power — customers pay up — rather than fighting for pennies.' },
          ].map((c) => (
            <div key={c.n} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
              <h4 className="text-sm font-bold mb-2"><span className="text-[var(--color-accent)]">{c.n}.</span> {c.title}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
            <h4 className="text-sm font-bold mb-2">Why we sometimes disagree with Wall Street</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Wall Street ratings lean on momentum and next quarter's earnings estimates. Our framework only cares
              whether the business generates real cash, keeps honest books, carries survivable debt, and sells at a
              sane price <em>today</em>. So a stock that has doubled can rate HOLD here while analysts say Strong
              Buy — and a beaten-down stock can rate BUY while the chart looks ugly. Neither view is "right." They
              answer different questions: <em>will the price go up soon?</em> versus <em>is this a good business at
              this price?</em> We show you both on every card so you can pick the lens that matches your horizon.
            </p>
          </div>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
            <h4 className="text-sm font-bold mb-2">"What Would Change This Verdict"</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Every HOLD and SELL card includes this panel. It's plain arithmetic, not a prediction: the exact
              price, cash flow, or health score at which the stock would cross into the next rating under today's
              numbers. If a card says "BUY if price ≤ $105.60 at current FCF," that's simply the price where the 5%
              cash-yield check passes. Use it as a watch level, not a forecast.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 5: Screening Checklists ── */}
      <section id="screening-checklist" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">5️⃣</span> Quick Screening Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--color-surface-2)] border border-emerald-500/20 rounded-2xl p-6"
          >
            <h3 className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Quality Company Signals
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Financial Stability (Must Have)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> OCF/Net Income &ge; 1.0 (cash quality check)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Debt/Equity &lt; 1.0 (manageable debt)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Current Ratio &gt; 1.5 (can pay bills)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Health Score &gt; 70 (B+ or better)</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Profitability (Should Have)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> ROE &gt; 15% (efficient capital use)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Profit Margin &gt; 10% (pricing power)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Positive Free Cash Flow (generating cash)</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Red Flags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--color-surface-2)] border border-red-500/20 rounded-2xl p-6"
          >
            <h3 className="text-base font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Red Flags to Avoid
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Critical (Avoid)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> OCF/NI &lt; 0.8 — possible accounting manipulation</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> Debt/Equity &gt; 3.0 — dangerously overleveraged</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> Current Ratio &lt; 1.0 — liquidity crisis risk</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> Negative FCF for 3+ years (mature company)</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> Health Score &lt; 40 (D grade)</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> Payout Ratio &gt; 100% — borrowing to pay dividends</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Warning Signs (Investigate)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> ROE &lt; 10% — inefficient business</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> Declining revenue for 2+ years</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> P/E &gt; 50 with slowing growth</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> Dividend yield &gt; 8% with Payout Ratio &gt; 80% — yield trap</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
        <FrameworkChip>This checklist is the human version of what the framework automates. If you only remember one line: OCF/NI below 1.0 means stop and ask why.</FrameworkChip>
      </section>

      {/* ── Section 6: Investment Strategies ── */}
      <section id="investment-strategies" className="mb-16">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-lg">6️⃣</span> Investment Strategies by Metric Focus
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Graham Value */}
          <div className="bg-[var(--color-surface-2)] border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold">Value Investing</h3>
            </div>
            <p className="text-xs text-blue-400 mb-4">Benjamin Graham Style — "Buy a dollar for 50 cents"</p>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>P/E Ratio &lt; 15</li>
              <li>P/B Ratio &lt; 1.5</li>
              <li>Debt/Equity &lt; 0.5</li>
              <li>Current Ratio &gt; 2.0</li>
              <li>FCF Yield &gt; 5%</li>
            </ul>
          </div>

          {/* Growth */}
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-base font-bold">Growth Investing</h3>
            </div>
            <p className="text-xs text-[var(--color-accent)] mb-4">Pay fair price for rapidly growing companies</p>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>Revenue Growth &gt; 20% annually</li>
              <li>ROE &gt; 20%</li>
              <li>P/FCF 25-40 (willing to pay premium)</li>
              <li>OCF/NI &ge; 1.0 (quality check)</li>
              <li>Profit Margin improving</li>
            </ul>
          </div>

          {/* Income */}
          <div className="bg-[var(--color-surface-2)] border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400 text-lg font-bold">$</span>
              <h3 className="text-base font-bold">Income Investing</h3>
            </div>
            <p className="text-xs text-emerald-400 mb-4">Stable companies with reliable dividends</p>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>Dividend Yield &gt; 3%</li>
              <li>Payout Ratio &lt; 60% (sustainable)</li>
              <li>FCF &gt; Dividend Payments (sustainable)</li>
              <li>Debt/Equity &lt; 1.0 (safety)</li>
              <li>Current Ratio &gt; 2.0</li>
              <li>Health Score &gt; 70</li>
            </ul>
          </div>

          {/* GARP */}
          <div className="bg-[var(--color-surface-2)] border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400 text-lg">🎯</span>
              <h3 className="text-base font-bold">GARP (Balanced)</h3>
            </div>
            <p className="text-xs text-purple-400 mb-4">Peter Lynch Style — Growth at a Reasonable Price</p>
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>P/E 15-25 (reasonable valuation)</li>
              <li>Revenue Growth 10-20%</li>
              <li>ROE &gt; 15%</li>
              <li>FCF Yield 3-8%</li>
              <li>OCF/NI &ge; 1.0</li>
            </ul>
          </div>
        </div>
        <FrameworkChip>Our Growth &amp; Quality verdict is closest to the Value and GARP columns. Growth and Income investors: use the card's raw metrics against your own column's thresholds.</FrameworkChip>
      </section>

      {/* ── Pro Tips ── */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-2xl p-8">
          <h3 className="text-lg font-bold mb-4">💡 Pro Tips</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">1.</span> No single metric tells the whole story — use combinations</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">2.</span> Compare to industry peers — Tech vs Banks have different norms</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">3.</span> Look for trends — improving metrics &gt; absolute values</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">4.</span> Context matters — check recent news and industry conditions</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">5.</span> Quality &gt; Price — better to overpay slightly for quality than underpay for junk</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">6.</span> The OCF/NI ratio is non-negotiable — if &lt; 1.0, be VERY cautious</li>
            <li className="flex items-start gap-2"><span className="text-[var(--color-accent)]">7.</span> Focus on what you understand — avoid complex businesses you can't evaluate</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION F: The Short Version (WO-ASA-002.18 closer) ── */}
      <section id="the-short-version" className="mb-12">
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-8">
          <h3 className="text-lg font-bold mb-4">The Short Version</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">If you retain nothing else from this page:</p>
          <ol className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <li><span className="font-bold text-[var(--color-text-primary)]">1. Cash is the truth serum.</span> Profits are an opinion; cash in the bank is a fact. OCF/NI below 1.0 means the opinion and the fact disagree — find out why.</li>
            <li><span className="font-bold text-[var(--color-text-primary)]">2. Price is what you pay for cash, not for a story.</span> FCF yield tells you what the business actually hands back per dollar invested. Compare it to what a bond pays.</li>
            <li><span className="font-bold text-[var(--color-text-primary)]">3. Debt decides who survives.</span> A wonderful business with a fragile balance sheet is a wonderful business you might not own for long.</li>
            <li><span className="font-bold text-[var(--color-text-primary)]">4. One date per card, one currency per card, and "n/m" when a number would lie.</span> If a stat can't be verified, we say so instead of guessing.</li>
            <li><span className="font-bold text-[var(--color-text-primary)]">5. Two honest views beat one confident one.</span> Wall Street answers "will it go up soon?" We answer "is it a good business at this price?" You get both.</li>
          </ol>
          <p className="text-sm text-[var(--color-text-secondary)] mt-5 pt-4 border-t border-[var(--color-border)]/50">
            Graham needed a book because his readers had to compute all of this by hand from paper annual reports.
            You don't. The card does the arithmetic; this guide makes sure you understand what it's telling you.
          </p>
        </div>
      </section>
    </div>
  );
}
