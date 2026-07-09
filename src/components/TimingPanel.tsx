import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { TimingData, TimingCondition, StockSnapshot, Methodology } from '../types/stock';
import { getRecommendation } from '../services/stockApi';

/**
 * TimingPanel (WO-ASA-TIMING) — the "when" dimension, rendered BESIDE the verdict
 * card and never merged with it. Evidence, never instruction: no imperatives, no
 * predictions. Ships under the "validation in progress" label until WO-VAL-Timing
 * publishes. All values come from the backend `timing` payload; nothing is
 * re-derived or fabricated here.
 *
 * Begin Tracking: a one-click "tracking anchor" (today's date — no manual price,
 * no cost-basis wording) that unlocks E4 (entry-anchored VWAP). The anchor is
 * remembered per ticker in localStorage and re-applied on load.
 */

interface TimingPanelProps {
  timing?: TimingData | null;
  snapshot: StockSnapshot;
  methodology: Methodology;
}

const STATE_LABEL: Record<string, string> = {
  WATCH: 'Watch',
  ENTRY_WINDOW: 'Entry window',
  HOLD: 'Holding conditions intact',
  TRIM_CONDITIONS_ELEVATED: 'Trim conditions elevated',
  EXIT_CONDITIONS_ELEVATED: 'Exit conditions elevated',
  AVOID: 'Regime off',
};

function statusChip(status: TimingCondition['status']) {
  if (status === 'active') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (status === 'inactive') return 'bg-emerald-500/10 text-emerald-300/80 border-emerald-500/20';
  return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}
function statusText(status: TimingCondition['status']) {
  if (status === 'active') return 'Active';
  if (status === 'inactive') return 'Clear';
  return 'Not tracked';
}

function ConditionRow({ c }: { c: TimingCondition }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className={`shrink-0 mt-0.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusChip(c.status)}`}>
        {statusText(c.status)}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--color-text-primary)]">{c.label}</div>
        <div className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{c.evidence}</div>
      </div>
    </div>
  );
}

export default function TimingPanel({ timing, snapshot, methodology }: TimingPanelProps) {
  const anchorKey = `ml_timing_anchor_${snapshot.ticker}`;
  const [override, setOverride] = useState<TimingData | null>(null);
  const [anchorDate, setAnchorDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loadedRef = useRef(false);

  // On mount: if a tracking anchor was saved for this ticker, re-apply it so E4
  // stays unlocked across visits.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(anchorKey);
    } catch {
      saved = null;
    }
    if (saved) {
      setAnchorDate(saved);
      void refetch(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refetch(date: string | null) {
    setBusy(true);
    try {
      const rec = await getRecommendation(
        snapshot,
        methodology,
        undefined,
        date ? { date } : null
      );
      setOverride(rec.timing ?? null);
    } catch {
      /* keep the current panel on failure */
    }
    setBusy(false);
  }

  function beginTracking() {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(anchorKey, today);
    } catch {
      /* ignore */
    }
    setAnchorDate(today);
    void refetch(today);
  }

  function stopTracking() {
    try {
      localStorage.removeItem(anchorKey);
    } catch {
      /* ignore */
    }
    setAnchorDate(null);
    void refetch(null);
  }

  const data = override ?? timing;
  if (!data) return null;

  const stateLabel = STATE_LABEL[data.state] ?? data.state;
  const zone = data.entry_zone;
  const money = (n: number) =>
    n >= 1000 ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toFixed(2)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl overflow-hidden bg-sky-500/[0.04] border-sky-500/20"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold" title="Timing is a separate dimension from the verdict — it may agree or disagree. The verdict says what and why; timing describes when.">
              Timing — <span className="text-sky-300">{stateLabel}</span>
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{data.headline}</p>
          </div>
        </div>
        {data.validation_state === 'in_progress' && (
          <span
            className="shrink-0 rounded-md border border-zinc-500/30 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
            title="These conditions are tracked and shown as evidence. Their historical value has not yet been validated, so no signal or performance claim is made."
          >
            Validation in progress
          </span>
        )}
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Begin Tracking — one-click anchor (no manual price, no cost basis).
            no-print: an interactive control is excluded from the PDF report; the
            timing state / conditions / zone / label below still render into it. */}
        <div className="no-print flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 px-4 py-3">
          <div className="text-xs text-[var(--color-text-secondary)]">
            {anchorDate ? (
              <>Tracking anchor set <span className="text-[var(--color-text-primary)]">{anchorDate}</span> — this unlocks the entry-anchored VWAP condition.</>
            ) : (
              <>Set a tracking anchor to follow price against your entry-anchored VWAP.</>
            )}
          </div>
          {anchorDate ? (
            <button onClick={stopTracking} disabled={busy}
              className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50">
              {busy ? '…' : 'Stop tracking'}
            </button>
          ) : (
            <button onClick={beginTracking} disabled={busy}
              className="shrink-0 rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 disabled:opacity-50">
              {busy ? '…' : '🔖 Begin tracking'}
            </button>
          )}
        </div>

        {zone && (
          <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Entry zone</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {money(zone.low)} – {money(zone.high)}
              <span className="text-[var(--color-text-secondary)]">
                {' '}· current {money(zone.current)}
                {Math.abs(zone.distance_pct) >= 0.005 &&
                  ` (${Math.round(Math.abs(zone.distance_pct) * 100)}% ${zone.distance_pct > 0 ? 'above' : 'below'} the zone)`}
                {Math.abs(zone.distance_pct) < 0.005 && ' (in the zone)'}
              </span>
            </div>
          </div>
        )}

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Exit conditions · {data.exit_active} of {data.exit_tracked} active
          </div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {data.exit_conditions.map((c) => <ConditionRow key={c.id} c={c} />)}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Entry conditions · {data.entry_active} of {data.entry_tracked} aligned
          </div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {data.entry_conditions.map((c) => <ConditionRow key={c.id} c={c} />)}
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
