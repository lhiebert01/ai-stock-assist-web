import { motion } from 'motion/react';
import {
  BookOpen, ExternalLink, Shield, TrendingUp, CheckCircle2,
} from 'lucide-react';

const blogEpisodes = [
  { ep: 0, emoji: '💎', title: 'The Diamond in the Brook', hook: 'The "acres of diamonds" parable — investment opportunities are already in public markets.', url: 'https://lindsayhiebert.substack.com/p/episode-0-the-diamond-in-the-brook' },
  { ep: 1, emoji: '🎰', title: 'Gambling vs Investing', hook: 'Why "AI is the future" isn\'t an investment thesis. Learn Benjamin Graham\'s 5 criteria.', url: 'https://lindsayhiebert.substack.com/p/episode-1-the-difference-between' },
  { ep: 2, emoji: '💰', title: 'Cash Doesn\'t Lie', hook: 'How a 35% earnings surprise fooled millions — and why cash flow saves your financial future.', url: 'https://lindsayhiebert.substack.com/p/episode-2-cash-doesnt-lie' },
  { ep: 3, emoji: '🚗', title: 'The $100 Honda', hook: 'Share price means nothing alone — learn why Price-to-Free-Cash-Flow reveals true value.', url: 'https://lindsayhiebert.substack.com/p/episode-3-the-100-honda' },
  { ep: 4, emoji: '🐺', title: 'The Boy Who Cried Wolf', hook: '22% earnings growth sounds amazing — until you check the OCF/NI ratio. Spot creative accounting.', url: 'https://lindsayhiebert.substack.com/p/22-earnings-growth-so-why-didnt-the' },
];

const grahamMetrics = [
  { name: 'P/E Ratio', benchmark: '< 15 (undervalued)' },
  { name: 'P/B Ratio', benchmark: '< 1.5 (asset value)' },
  { name: 'Current Ratio', benchmark: '> 2.0 (liquid)' },
  { name: 'Dividend History', benchmark: '20+ years consistent' },
  { name: 'Graham Number', benchmark: 'Price below = margin of safety' },
];

const growthMetrics = [
  { name: 'FCF Yield', benchmark: '> 5% (strong cash generation)' },
  { name: 'P/FCF Ratio', benchmark: '< 20 (fairly priced)' },
  { name: 'OCF/NI Ratio', benchmark: '> 1.0 (quality earnings)' },
  { name: 'ROE', benchmark: '> 15% (efficient capital use)' },
  { name: 'Profit Margin', benchmark: '> 10% (pricing power)' },
];

const ecosystem = [
  { name: 'AI Stock Assist', tagline: 'Wealthy', url: 'https://aistockassist.com', emoji: '📈' },
  { name: 'Neo-Aesop', tagline: 'Wise', url: 'https://neoaesop.com', emoji: '📚' },
  { name: 'HeroicVerse', tagline: 'Healthy', url: 'https://heroicverse.app', emoji: '🏋️' },
  { name: 'iAppreciateYou', tagline: 'Positivity', url: 'https://affirm.neoaesop.com', emoji: '🙏' },
];

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm text-[var(--color-accent)] font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          Free Education
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Learn to Invest Smarter</h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
          Short, actionable lessons and reference guides — no jargon, no fluff.
        </p>
      </div>

      {/* Blog Episodes */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-6">Substack Series</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogEpisodes.map((ep, i) => (
            <motion.a
              key={ep.ep}
              href={ep.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{ep.emoji}</span>
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Ep {ep.ep}</span>
              </div>
              <h3 className="text-base font-bold mb-1.5 group-hover:text-[var(--color-accent)] transition-colors">{ep.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{ep.hook}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium">
                Read on Substack <ExternalLink className="w-3 h-3" />
              </div>
            </motion.a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://lindsayhiebert.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-surface-3)] border border-[var(--color-border)] text-white font-bold rounded-xl hover:bg-[var(--color-border-light)] transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Subscribe on Substack
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Methodology Deep-Dive */}
      <section className="mb-16">
        <h2 className="text-xl font-bold mb-2">Two Investment Frameworks</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          Choose the methodology that matches your investing style.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graham Value */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--color-surface-2)] border border-blue-500/30 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold">Graham Value</h3>
            </div>
            <p className="text-xs text-blue-400 font-medium mb-5">Best for: Conservative, long-term value investors</p>
            <ul className="space-y-3">
              {grahamMetrics.map((m) => (
                <li key={m.name} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{m.name}</span>
                    {' '}
                    <span className="text-[var(--color-text-muted)]">— {m.benchmark}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Growth & Quality */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <h3 className="text-lg font-bold">Growth & Quality</h3>
            </div>
            <p className="text-xs text-[var(--color-accent)] font-medium mb-5">Best for: Growth-oriented investors focused on cash flow</p>
            <ul className="space-y-3">
              {growthMetrics.map((m) => (
                <li key={m.name} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{m.name}</span>
                    {' '}
                    <span className="text-[var(--color-text-muted)]">— {m.benchmark}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem */}
      <section>
        <h2 className="text-xl font-bold mb-2">AI for Good — Making Every Person Smarter</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          A family of AI apps designed to make you wealthier, wiser, healthier, and more positive.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          {ecosystem.map((app, i) => (
            <motion.a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-5 text-center hover:border-[var(--color-accent)]/30 transition-all"
            >
              <span className="text-3xl block mb-2">{app.emoji}</span>
              <h3 className="text-sm font-bold mb-0.5 group-hover:text-[var(--color-accent)] transition-colors">{app.name}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">{app.tagline}</p>
            </motion.a>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          <a href="https://twitter.com/intent/tweet?text=Check%20out%20AI%20Stock%20Assist%20%E2%80%94%20AI-powered%20stock%20analysis%20in%20seconds!&url=https://aistockassist.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/30 transition-all">
            Share on Twitter
          </a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://aistockassist.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/30 transition-all">
            Share on LinkedIn
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https://aistockassist.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-accent)]/30 transition-all">
            Share on Facebook
          </a>
        </div>
      </section>
    </div>
  );
}
