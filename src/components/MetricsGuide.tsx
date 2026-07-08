import { motion } from 'motion/react';
import { METRICS, SECTIONS, CHECKLIST, DEFINITIONS_VERSION } from '../lib/metricsDictionary';
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

      {/* ── SECTION G: Choosing a Lens (WO-ASA-005.2 / MVQ addendum 🟢) ── */}
      <section id="choosing-a-lens" className="max-w-3xl mx-auto mb-12">
        <h2 className="text-xl font-bold mb-3">Choosing a Lens</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
          This app can score the same stock through more than one framework. Same data, same date, different
          questions. None of them predicts anything; each one is a different way of asking "is this a good business
          at this price?"
        </p>
        <div className="space-y-3">
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
            <h4 className="text-sm font-bold mb-1">Growth &amp; Quality</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Six checks on cash generation, earnings honesty, profitability, and balance-sheet strength, scored
              0–6. If you want one lens and don't know which, start here.
            </p>
          </div>
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
            <h4 className="text-sm font-bold mb-1">Graham Classic</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Benjamin Graham's 1949 value criteria, unmodified. A historical lens: its thresholds were written for
              railroads and department stores, and by modern standards they are strict — most large modern companies
              rate HOLD or SELL under them. That strictness is the point of keeping it: it shows you what "cheap"
              meant when the idea of value investing was invented, and it makes a useful sparring partner for any
              modern verdict.
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-4">
          When two lenses disagree on a stock, the card says so and shows exactly which checks diverged.
          Disagreement isn't an error — it's information about which question each framework is asking.
        </p>
      </section>

      {/* Jump to section */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { label: 'Choosing a Lens', href: '#choosing-a-lens' },
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
              title: 'Rated — with caveats, and NOT RATED',
              body: 'When some figures can\'t be fetched or verified, the card scores what did verify, lists exactly what\'s missing and why, and shows a confidence level. NOT RATED is reserved for the rare case we can\'t trust a stock\'s identity or currency at all — figures that contradict each other or can\'t be cleanly converted. Missing data is never treated as bad data; unverifiable data is never scored.',
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

      {/* ── Metric sections 1-4: rendered FROM the metrics dictionary
          (WO-ASA-006.1) — no tier, formula, or threshold is hardcoded here ── */}
      {SECTIONS.map((sec) => (
        <section
          key={sec.id}
          id={{ valuation: 'price-and-valuation', cashflow: 'cash-flow', profitability: 'profitability', balance: 'balance-sheet' }[sec.id]}
          className="mb-16"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-lg">{sec.emoji}</span> {sec.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {METRICS.filter((m) => m.section === sec.id).map((m) => (
              <MetricCard
                key={m.id}
                name={m.name}
                formula={m.formula}
                benchmarks={m.tiers}
                interpretation={m.interpretation}
                proTip={m.proTip}
              />
            ))}
          </div>
          <FrameworkChip>{sec.chip}</FrameworkChip>
        </section>
      ))}

      {/* ── SECTION B: How Verdicts Are Scored (WO-ASA-002.18; AEO anchor target) ── */}
      <section id="how-verdicts-are-scored" className="mb-16">
        <h2 className="text-xl font-bold mb-1">How Verdicts Are Scored <span className="text-base font-medium text-[var(--color-text-muted)]">— Growth &amp; Quality</span></h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">Each framework has its own scoring page; this one covers Growth &amp; Quality.</p>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-3xl">
          Every stock you analyze gets a verdict — <strong>BUY</strong>, <strong>HOLD</strong>, or{' '}
          <strong>SELL</strong> — from the Growth &amp; Quality framework. There's no black box. The verdict comes
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
            <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              {CHECKLIST.quality.map((item) => (
                <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {item}</li>
              ))}
            </ul>
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
              <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                {CHECKLIST.redFlags.map((item) => (
                  <li key={item} className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /> {item}</li>
                ))}
              </ul>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Warning Signs (Investigate)</p>
                <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  {CHECKLIST.warnings.map((item) => (
                    <li key={item} className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" /> {item}</li>
                  ))}
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

      <p className="text-xs text-[var(--color-text-muted)] text-center pb-8">
        Definitions {DEFINITIONS_VERSION} — this guide and the in-app sidebar render from one metrics dictionary.
      </p>
    </div>
  );
}
