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

      {/* Jump to section */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {['Price & Valuation', 'Cash Flow', 'Profitability', 'Balance Sheet', 'Screening Checklist', 'Investment Strategies'].map((s) => (
          <a key={s} href={`#${s.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`} className="px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-all">
            {s}
          </a>
        ))}
      </div>

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
            interpretation="How much you pay per dollar of real cash. More reliable than P/E because cash can't be manipulated like accounting earnings. Warren Buffett's preferred metric."
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
        </div>
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
            proTip="Negative FCF is OK for early-stage growth companies investing heavily. For mature companies, it's a red flag."
          />
          <MetricCard
            name="FCF Yield"
            formula="(Free Cash Flow / Market Cap) x 100"
            benchmarks={[
              { color: 'green', text: '> 5% Very good' },
              { color: 'yellow', text: '3–5% Good' },
              { color: 'red', text: '< 0% Burning cash' },
            ]}
            interpretation="Cash return on the stock price. A 6% FCF Yield means you're getting 6% of your investment back in cash each year. Compare to the 10-year Treasury yield (~4%) — if FCF Yield > 5%, the stock may be undervalued."
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
            proTip="Warren Buffett's rule: Look for ROE > 15% consistently over multiple years, not just one good quarter."
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
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Warning Signs (Investigate)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> ROE &lt; 10% — inefficient business</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> Declining revenue for 2+ years</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> P/E &gt; 50 with slowing growth</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> Dividend yield &gt; 8% — may be unsustainable</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
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
    </div>
  );
}
