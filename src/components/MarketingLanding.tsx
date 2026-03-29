import { motion } from 'motion/react';
import {
  TrendingUp, BarChart3, Brain, Shield, Zap, ArrowRight,
  CheckCircle2, ChevronDown, Sparkles, LineChart, DollarSign,
} from 'lucide-react';
import SEO from './SEO';
import { getSoftwareApplicationJsonLd, getFAQJsonLd } from '../lib/json-ld';
import { CREDIT_PACKS } from '../types/user';

interface LandingProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Gemini AI Analysis',
    desc: 'Google Gemini 3.1 Pro generates professional BUY/HOLD/SELL recommendations with confidence ratings.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Deep Fundamentals',
    desc: 'Cash flow quality, balance sheet health, valuation metrics — the numbers Wall Street analysts use.',
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: 'Interactive Charts',
    desc: 'TradingView-powered charts with 8 time periods. Professional-grade price visualization.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Multi-Stock Compare',
    desc: 'Analyze up to 10 stocks side-by-side. AI identifies the best opportunity and stocks to avoid.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Two Methodologies',
    desc: 'Choose Graham Value Investing (strict criteria) or Growth & Quality (cash flow focus).',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Stock Discovery',
    desc: 'Browse curated categories: undervalued large caps, tech growth, small cap gainers, and more.',
  },
];

const faqs = [
  { question: 'Is AI Stock Assist free?', answer: 'You get 3 free analyses when you sign up. After that, purchase analysis packs starting at $4.99 for 20 analyses.' },
  { question: 'What AI model powers the analysis?', answer: 'We use Google Gemini 3.1 Pro for primary analysis with Groq Llama 3.3 70B as a reliable backup, ensuring 99.9% uptime.' },
  { question: 'How accurate are the recommendations?', answer: 'Our AI analyzes real financial data from Yahoo Finance including cash flow, balance sheet, and valuation metrics. Recommendations are data-driven, not predictions. Always do your own due diligence.' },
  { question: 'Can I export my analysis?', answer: 'Yes. Export any analysis as a formatted Word document with all metrics, charts, and AI recommendations included.' },
];

const stats = [
  { value: '50+', label: 'Financial Metrics' },
  { value: '<5s', label: 'Analysis Time' },
  { value: '2', label: 'AI Methodologies' },
  { value: '10', label: 'Stocks at Once' },
];

export default function MarketingLanding({ onGetStarted }: LandingProps) {
  return (
    <>
      <SEO jsonLd={[getSoftwareApplicationJsonLd(), getFAQJsonLd(faqs)]} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)] font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Powered by Google Gemini 3.1 Pro
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Professional Stock Analysis
              <br />
              <span className="text-[var(--color-accent)]">in Under 5 Seconds</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              AI Stock Assist uses Google Gemini AI to analyze fundamentals, cash flow quality, and valuation —
              then delivers a clear BUY, HOLD, or SELL recommendation with full reasoning.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-[var(--color-accent)] text-[var(--color-surface-0)] text-lg font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center gap-2"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-[var(--color-text-muted)]">3 free analyses, no credit card required</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[var(--color-accent)]">{s.value}</div>
                  <div className="text-xs sm:text-sm text-[var(--color-text-muted)]">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center pb-8">
          <ChevronDown className="w-6 h-6 text-[var(--color-text-muted)] animate-bounce" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Invest Smarter</h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            The same metrics and analysis Wall Street professionals use — delivered in seconds by AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[var(--color-text-secondary)] text-lg">
            Start free. Pay only when you need more analyses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          {CREDIT_PACKS.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ y: -4 }}
              className={`relative bg-[var(--color-surface-2)] border rounded-2xl p-8 ${
                pack.popular
                  ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
                  : 'border-[var(--color-border)]'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--color-accent)] text-[var(--color-surface-0)] text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{pack.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{pack.tagline}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">${pack.price}</span>
                <span className="text-[var(--color-text-muted)]">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pack.analyses} stock analyses</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pack.pricePerAnalysis} per analysis</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI recommendations included</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Word export included</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  pack.popular
                    ? 'bg-[var(--color-accent)] text-[var(--color-surface-0)] hover:brightness-110'
                    : 'bg-[var(--color-surface-3)] text-white hover:bg-[var(--color-border-light)]'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Get {pack.name}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            All plans include 3 free analyses to start. No subscription — buy only what you need.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-medium hover:bg-white/5 transition-colors">
                {faq.question}
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-3xl p-10 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Invest Smarter?</h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-lg mx-auto">
            Join thousands of investors using AI to make data-driven decisions.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-[var(--color-accent)] text-[var(--color-surface-0)] text-lg font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center gap-2 mx-auto"
          >
            <TrendingUp className="w-5 h-5" />
            Start Your Free Analysis
          </button>
        </div>
      </section>
    </>
  );
}
