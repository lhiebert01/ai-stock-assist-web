import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import {
  METRICS, SECTIONS, TWO_LENSES, READING_THE_CARD_MICRO, CHECKLIST, DEFINITIONS_VERSION,
} from '../lib/metricsDictionary';
import type { TierColor } from '../lib/metricsDictionary';

/**
 * Sidebar quick-reference Metrics Guide (WO-ASA-006.3).
 * EVERY name, formula, tier, and checklist line renders from
 * lib/metricsDictionary.ts — nothing metric-shaped is hardcoded here, so this
 * surface can never drift from the Learn-page guide again.
 */

interface MetricsGlossaryProps {
  open: boolean;
  onClose: () => void;
}

function Badge({ color, children }: { color: TierColor; children: React.ReactNode }) {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[color]}`}>
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
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* ── Two Lenses header (compact: fits one phone screen) ── */}
              <section className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Two Lenses
                </h3>
                {TWO_LENSES.map((l) => (
                  <p key={l.name} className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-1.5">
                    <span className="font-bold text-[var(--color-text-primary)]">{l.name}</span> — {l.body}
                  </p>
                ))}
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Metrics below tag which checks they feed.{' '}
                  <a href="/?view=metrics#how-verdicts-are-scored" className="text-[var(--color-accent)] hover:underline">Full methodology →</a>
                </p>
              </section>

              {/* ── Reading the Card micro-entries ── */}
              <section className="grid grid-cols-1 gap-2">
                {READING_THE_CARD_MICRO.map((m) => (
                  <p key={m.title} className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]/60">
                    <span className="font-bold text-[var(--color-text-primary)]">{m.title}. </span>{m.body}
                  </p>
                ))}
              </section>

              {/* ── Metric sections — rendered FROM the dictionary ── */}
              {SECTIONS.map((section) => (
                <section key={section.id}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{section.title}</h3>
                  <div className="space-y-3">
                    {METRICS.filter((m) => m.section === section.id).map((m) => (
                      <div key={m.id} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold">{m.shortName ?? m.name}</h4>
                          {m.framework && (
                            <span className="text-[9px] text-[var(--color-text-muted)] shrink-0 text-right max-w-[45%]">{m.framework}</span>
                          )}
                        </div>
                        {m.formula && (
                          <p className="text-xs text-[var(--color-text-muted)] font-mono mb-2">{m.formula}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {m.tiers.map((t, i) => <Badge key={i} color={t.color}>{t.text}</Badge>)}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{m.oneLiner}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 px-3 py-2 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/15 text-[10px] text-[var(--color-text-secondary)] italic">
                    <span className="not-italic font-bold text-[var(--color-accent)]">⚡ Framework: </span>{section.chip}
                  </p>
                </section>
              ))}

              {/* ── Screening checklist (from the dictionary) ── */}
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Quick Screening Checklist</h3>
                <div className="bg-[var(--color-surface-2)] border border-emerald-500/20 rounded-xl p-4 mb-3">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3">Quality Company Signals</h4>
                  <ul className="space-y-2">
                    {CHECKLIST.quality.map((item) => (
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
                    {CHECKLIST.redFlags.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs font-bold text-[var(--color-text-primary)] mt-3 px-1">
                  If you only remember one line: {CHECKLIST.canonicalLine}
                </p>
              </section>

              <p className="text-[10px] text-[var(--color-text-muted)] text-center pb-4">
                Definitions {DEFINITIONS_VERSION} — one dictionary renders this panel and the full guide.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
