import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricsGlossaryProps {
  open: boolean;
  onClose: () => void;
}

interface Metric {
  name: string;
  formula?: string;
  green: string;
  yellow?: string;
  red: string;
  interpretation: string;
}

const sections: { title: string; metrics: Metric[] }[] = [
  {
    title: 'Price & Valuation',
    metrics: [
      { name: 'P/E Ratio', formula: 'Price / Earnings per Share', green: '< 15', yellow: '15–25', red: '> 25', interpretation: 'How much you pay per dollar of earnings. Lower = cheaper.' },
      { name: 'P/B Ratio', formula: 'Price / Book Value per Share', green: '< 1.5', yellow: '1.5–3.0', red: '> 3.0', interpretation: 'Price vs. net asset value. Under 1.5 = potential bargain.' },
      { name: 'P/FCF Ratio', formula: 'Price / Free Cash Flow per Share', green: '< 15', yellow: '15–25', red: '> 25', interpretation: 'How much you pay per dollar of real cash. Lower = better.' },
      { name: 'Market Cap', interpretation: 'Total value of all shares. Mega (>$200B), Large, Mid, Small, Micro.', green: 'Context-dependent', red: 'N/A' },
      { name: '52-Week Range', interpretation: 'Highest and lowest price in the past year. Shows volatility.', green: 'Near low', yellow: 'Mid-range', red: 'Near high' },
      { name: 'Dividend Yield', formula: 'Annual Dividend / Share Price', green: '> 2%', yellow: '1–2%', red: '0% or unsustainable', interpretation: 'Cash returned to shareholders yearly as a percentage of price.' },
    ],
  },
  {
    title: 'Cash Flow',
    metrics: [
      { name: 'Free Cash Flow (FCF)', formula: 'Operating CF - Capital Expenditures', green: 'Positive & growing', red: 'Negative or declining', interpretation: 'Cash left after running the business. The truest measure of profitability.' },
      { name: 'FCF Yield', formula: 'FCF / Market Cap', green: '> 5%', yellow: '3–5%', red: '< 3%', interpretation: 'Cash return on the stock price. Higher = more cash per dollar invested.' },
      { name: 'Operating Cash Flow (OCF)', interpretation: 'Cash generated from core business operations, before capital spending.', green: 'Positive & growing', red: 'Negative' },
      { name: 'OCF/NI Ratio', formula: 'Operating CF / Net Income', green: '> 1.0', yellow: '0.8–1.0', red: '< 0.8', interpretation: 'Earnings quality check. Below 1.0 = earnings may include non-cash tricks. A red flag for creative accounting.' },
    ],
  },
  {
    title: 'Profitability',
    metrics: [
      { name: 'Return on Equity (ROE)', formula: 'Net Income / Shareholders\' Equity', green: '> 15%', yellow: '10–15%', red: '< 10%', interpretation: 'How efficiently the company uses shareholder money to generate profit.' },
      { name: 'Profit Margin', formula: 'Net Income / Revenue', green: '> 10%', yellow: '5–10%', red: '< 5%', interpretation: 'How much of each revenue dollar becomes profit. Higher = pricing power.' },
    ],
  },
  {
    title: 'Balance Sheet Health',
    metrics: [
      { name: 'Health Score', interpretation: 'Composite score based on liquidity, leverage, and coverage ratios.', green: 'Strong', yellow: 'Moderate', red: 'Weak' },
      { name: 'Debt-to-Equity', formula: 'Total Debt / Shareholders\' Equity', green: '< 0.5', yellow: '0.5–1.0', red: '> 1.0', interpretation: 'How leveraged the company is. Lower = safer.' },
      { name: 'Current Ratio', formula: 'Current Assets / Current Liabilities', green: '> 2.0', yellow: '1.5–2.0', red: '< 1.5', interpretation: 'Can the company pay its bills this year? Above 2 = comfortable.' },
      { name: 'Quick Ratio', formula: '(Cash + Receivables) / Current Liabilities', green: '> 1.0', yellow: '0.5–1.0', red: '< 0.5', interpretation: 'Like current ratio but excludes inventory. Stricter liquidity test.' },
    ],
  },
];

const qualityChecklist = [
  'FCF Yield > 5%',
  'OCF/NI Ratio > 1.0',
  'ROE > 15%',
  'Profit Margin > 10%',
  'Debt-to-Equity < 0.5',
  'Current Ratio > 2.0',
];

const redFlags = [
  'OCF/NI Ratio < 0.8 — earnings may be inflated',
  'Negative Free Cash Flow — company is burning cash',
  'Debt-to-Equity > 2.0 — heavily leveraged',
  'Declining revenue + rising debt',
  'Dividend yield > 8% — may be unsustainable',
];

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

export default function MetricsGlossary({ open, onClose }: MetricsGlossaryProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[var(--color-surface-1)] border-l border-[var(--color-border)] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Metrics Guide</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              {/* Metric sections */}
              {sections.map((section) => (
                <details key={section.title} className="group" open>
                  <summary className="flex items-center justify-between py-3 cursor-pointer text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-white transition-colors">
                    {section.title}
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="space-y-4 pb-4">
                    {section.metrics.map((m) => (
                      <div key={m.name} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
                        <h4 className="text-sm font-bold mb-1">{m.name}</h4>
                        {m.formula && (
                          <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2">{m.formula}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <Badge color="green">{m.green}</Badge>
                          {m.yellow && <Badge color="yellow">{m.yellow}</Badge>}
                          <Badge color="red">{m.red}</Badge>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{m.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}

              {/* Quick Screening Checklist */}
              <details className="group" open>
                <summary className="flex items-center justify-between py-3 cursor-pointer text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-white transition-colors">
                  Quick Screening Checklist
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="space-y-4 pb-4">
                  <div className="bg-[var(--color-surface-2)] border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-emerald-400 mb-3">Quality Company Signals</h4>
                    <ul className="space-y-2">
                      {qualityChecklist.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[var(--color-surface-2)] border border-red-500/20 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-red-400 mb-3">Red Flags to Avoid</h4>
                    <ul className="space-y-2">
                      {redFlags.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
