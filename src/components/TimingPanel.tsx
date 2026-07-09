import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { TimingData, TimingCondition } from '../types/stock';

/**
 * TimingPanel (WO-ASA-TIMING) — the "when" dimension, rendered BESIDE the verdict
 * card and never merged with it. Evidence, never instruction: no imperatives, no
 * predictions. Ships under the "validation in progress" label until WO-VAL-Timing
 * publishes. All values come from the backend `timing` payload; nothing is
 * re-derived or fabricated here.
 */

interface TimingPanelProps {
  timing?: TimingData | null;
}

// Human labels for the internal state machine names (imperative-free).
const STATE_LABEL: Record<string, string> = {
  WATCH: 'Watch',
  ENTRY_WINDOW: 'Entry window',
  HOLD: 'Holding conditions intact',
  TRIM_CONDITIONS_ELEVATED: 'Trim conditions elevated',
  EXIT_CONDITIONS_ELEVATED: 'Exit conditions elevated',
  AVOID: 'Regime off',
};

function statusChip(status: TimingCondition['status']) {
  if (status === 'active')
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (status === 'inactive')
    return 'bg-emerald-500/10 text-emerald-300/80 border-emerald-500/20';
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'; // not_available
}

function statusText(status: TimingCondition['status']) {
  if (status === 'active') return 'Active';
  if (status === 'inactive') return 'Clear';
  return 'Not tracked';
}

function ConditionRow({ c }: { c: TimingCondition }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span
        className={`shrink-0 mt-0.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusChip(
          c.status
        )}`}
      >
        {statusText(c.status)}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--color-text-primary)]">
          {c.label}
        </div>
        <div className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {c.evidence}
        </div>
      </div>
    </div>
  );
}

export default function TimingPanel({ timing }: TimingPanelProps) {
  if (!timing) return null;

  const stateLabel = STATE_LABEL[timing.state] ?? timing.state;
  const zone = timing.entry_zone;
  const money = (n: number) =>
    n >= 1000 ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl overflow-hidden bg-sky-500/[0.04] border-sky-500/20"
    >
      {/* Header — clearly a SEPARATE panel from the verdict */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold" title="Timing is a separate dimension from the verdict — it may agree or disagree. The verdict says what and why; timing describes when.">
              Timing — <span className="text-sky-300">{stateLabel}</span>
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {timing.headline}
            </p>
          </div>
        </div>
        {timing.validation_state === 'in_progress' && (
          <span
            className="shrink-0 rounded-md border border-zinc-500/30 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
            title="These conditions are tracked and shown as evidence. Their historical value has not yet been validated, so no signal or performance claim is made."
          >
            Validation in progress
          </span>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Entry zone (Tier-1 Patience Refinement) — pure arithmetic, no claims */}
        {zone && (
          <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
              Entry zone
            </div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {money(zone.low)} – {money(zone.high)}
              <span className="text-[var(--color-text-secondary)]">
                {' '}· current {money(zone.current)}
                {Math.abs(zone.distance_pct) >= 0.005 &&
                  ` (${Math.round(Math.abs(zone.distance_pct) * 100)}% ${
                    zone.distance_pct > 0 ? 'above' : 'below'
                  } the zone)`}
                {Math.abs(zone.distance_pct) < 0.005 && ' (in the zone)'}
              </span>
            </div>
          </div>
        )}

        {/* Exit conditions */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Exit conditions · {timing.exit_active} of {timing.exit_tracked} active
          </div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {timing.exit_conditions.map((c) => (
              <ConditionRow key={c.id} c={c} />
            ))}
          </div>
        </div>

        {/* Entry conditions */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Entry conditions · {timing.entry_active} of {timing.entry_tracked} aligned
          </div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {timing.entry_conditions.map((c) => (
              <ConditionRow key={c.id} c={c} />
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          Timing describes named conditions and their evidence — it is not advice and
          not a prediction. Verdict and timing are separate lenses and may disagree.
        </p>
      </div>
    </motion.div>
  );
}
