import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Info } from 'lucide-react';
import type { TimingData, StockSnapshot, Methodology } from '../types/stock';
import { getRecommendation } from '../services/stockApi';
import {
  headerView, cardSignals, ENTRY_ZONE_LABEL, BETA_TOOLTIP,
  CARD1_TITLE, CARD1_LEADIN, CARD1_COUNTER, CARD2_TITLE, CARD2_COUNTER, PANEL_INTRO,
  type SignalView, type ChipTone,
} from '../lib/timingCopy';

/**
 * TimingPanel (WO-ASA-TIMING-COPY Rev B) — presentation only; signal logic is
 * upstream and unchanged. Renders BESIDE the verdict, never merged. All copy
 * comes from src/lib/timingCopy.ts (single source; the PDF report captures this
 * DOM, the DOCX mirrors the same strings). No imperative/predictive language.
 */
interface TimingPanelProps {
  timing?: TimingData | null;
  snapshot: StockSnapshot;
  methodology: Methodology;
}

interface Anchor { date: string; price: number; gapPct: number }

const CHIP: Record<ChipTone, string> = {
  ok: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  warn: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
  yes: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  muted: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/40',
};

// WCAG-AA header/section label: readable on the dark panel (not grey-on-grey).
const LABEL = 'text-[11px] font-bold uppercase tracking-wider text-zinc-200';

function Tip({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex align-middle cursor-help text-zinc-400 hover:text-zinc-200">
      <Info className="w-3 h-3" />
    </span>
  );
}

function SignalRow({ v }: { v: SignalView }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className={`shrink-0 mt-0.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CHIP[v.tone]}`}>
        {v.chip}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-[var(--color-text-primary)]">
          {v.title} <Tip text={v.tooltip} />
        </div>
        <div className="text-xs leading-relaxed text-zinc-300">{v.evidence}</div>
      </div>
    </div>
  );
}

function money(n: number) {
  return n >= 1000 ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toFixed(2)}`;
}

export default function TimingPanel({ timing, snapshot, methodology }: TimingPanelProps) {
  const ticker = snapshot.ticker;
  const anchorKey = `ml_timing_anchor_${ticker}`;
  const [override, setOverride] = useState<TimingData | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [busy, setBusy] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let saved: Anchor | null = null;
    try {
      const raw = localStorage.getItem(anchorKey);
      if (raw) saved = JSON.parse(raw) as Anchor;
    } catch { saved = null; }
    if (saved?.date) {
      setAnchor(saved);
      void refetch(saved.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refetch(date: string | null) {
    setBusy(true);
    try {
      const rec = await getRecommendation(snapshot, methodology, undefined, date ? { date } : null);
      setOverride(rec.timing ?? null);
    } catch { /* keep current panel */ }
    setBusy(false);
  }

  const data = override ?? timing;

  function beginTracking() {
    const today = new Date().toISOString().slice(0, 10);
    const cur = data?.entry_zone?.current ?? 0;
    const zone = data?.entry_zone;
    const gapPct = zone && zone.high > 0 ? Math.round(((cur - zone.high) / zone.high) * 100) : 0;
    const a: Anchor = { date: today, price: cur, gapPct };
    try { localStorage.setItem(anchorKey, JSON.stringify(a)); } catch { /* ignore */ }
    setAnchor(a);
    void refetch(today);
  }

  function stopTracking() {
    try { localStorage.removeItem(anchorKey); } catch { /* ignore */ }
    setAnchor(null);
    void refetch(null);
  }

  if (!data) return null;

  const hv = headerView(data.state);
  const headerTone = data.state === 'HOLD' || data.state === 'ENTRY_WINDOW' ? 'text-emerald-300' : 'text-amber-300';
  const zone = data.entry_zone;
  const exit = cardSignals(data, 'exit');
  const entry = cardSignals(data, 'entry');

  // Better-price range bar marker position (clamped).
  let markerPct = 50;
  if (zone && zone.high > zone.low) {
    markerPct = Math.max(0, Math.min(100, ((zone.current - zone.low) / (zone.high - zone.low)) * 100));
  }
  const gapAboveTop = zone && zone.current > zone.high
    ? Math.round(((zone.current - zone.high) / zone.high) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl overflow-hidden bg-sky-500/[0.04] border-sky-500/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-inherit gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-300 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className={`text-sm font-bold ${headerTone}`}>{hv.title}</h4>
            {hv.body && <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{hv.body}</p>}
          </div>
        </div>
        <span
          className="shrink-0 rounded-md border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-200 cursor-help"
          title={BETA_TOOLTIP}
        >
          Beta
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        <p className="text-xs text-zinc-300 leading-relaxed">
          {PANEL_INTRO(ticker)}{' '}
          <a href="/#metrics" className="text-sky-300 underline">Metrics Guide</a>.
        </p>

        {/* Begin Tracking — one-click anchor (no-print) */}
        <div className="no-print rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 p-4">
          {anchor ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-200 leading-relaxed">
                Tracking from <span className="font-bold">{money(anchor.price)}</span>, set {anchor.date}
                {' '}(price was {Math.abs(anchor.gapPct)}% {anchor.gapPct >= 0 ? 'above' : 'below'} the better-price range when set)
                {zone && <> · current: <span className="font-bold">{money(zone.current)}</span></>}
              </div>
              <button onClick={stopTracking} disabled={busy}
                className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-[11px] font-semibold text-zinc-200 hover:text-white disabled:opacity-50">
                {busy ? '…' : 'Stop'}
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-zinc-300 leading-relaxed">
                Want to track this stock from today’s price? One click marks the current price
                {zone && <> (<span className="font-semibold text-zinc-100">{money(zone.current)}</span>)</>} as your
                starting point — no typing needed. From then on we’ll show how the stock trades versus the average
                price paid since your start (weighted by trading volume). Reset anytime: Stop, then Begin again.
              </div>
              <button onClick={beginTracking} disabled={busy}
                className="shrink-0 rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-200 hover:bg-sky-500/20 disabled:opacity-50">
                {busy ? '…' : '🔖 Begin tracking'}
              </button>
            </div>
          )}
        </div>

        {/* Better-price range */}
        {zone && (
          <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)]/50 p-4">
            <div className={LABEL + ' mb-2'}>{ENTRY_ZONE_LABEL}</div>
            <div className="text-sm text-[var(--color-text-primary)]">
              {money(zone.low)} – {money(zone.high)} · current <span className="font-bold">{money(zone.current)}</span>
            </div>
            {gapAboveTop > 0 && (
              <div className="text-xs text-zinc-300 mt-1">
                <span className="font-bold">(Today, {ticker} is {gapAboveTop}% above the top of this range.)</span>
              </div>
            )}
            {/* horizontal range bar with current-price marker */}
            <div className="relative mt-3 h-2 rounded-full bg-zinc-700/60">
              <div className="absolute inset-y-0 left-[15%] right-[15%] rounded-full bg-emerald-500/40" />
              <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-sky-300 border border-sky-100"
                style={{ left: `calc(${15 + (markerPct * 0.7)}% - 5px)` }} title={`Current ${money(zone.current)}`} />
            </div>
          </div>
        )}

        {/* Card 1 — Exit / warning signs */}
        <div>
          <h5 className="text-sm font-bold text-[var(--color-text-primary)]">{CARD1_TITLE(ticker)}</h5>
          <p className="text-xs text-zinc-300 mt-0.5 mb-1">{CARD1_LEADIN}</p>
          <div className={LABEL + ' mb-1'}>{CARD1_COUNTER(exit.onCount, exit.shown)}</div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {exit.views.map((v) => <SignalRow key={v.id} v={v} />)}
          </div>
          {exit.footnote && (
            <p className="text-[11px] text-zinc-400 mt-2">{exit.footnote} <Tip text={exit.footnoteTip} /></p>
          )}
        </div>

        {/* Card 2 — Entry / green lights */}
        <div>
          <h5 className="text-sm font-bold text-[var(--color-text-primary)]">{CARD2_TITLE(ticker)}</h5>
          <div className={LABEL + ' mt-1 mb-1'}>{CARD2_COUNTER(entry.onCount, entry.shown)}</div>
          <div className="divide-y divide-[var(--color-border)]/30">
            {entry.views.map((v) => <SignalRow key={v.id} v={v} />)}
          </div>
          {entry.footnote && (
            <p className="text-[11px] text-zinc-400 mt-2">{entry.footnote} <Tip text={entry.footnoteTip} /></p>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-400">
          Timing describes named signals and their evidence — it is not advice and not a
          prediction. Verdict and timing are separate lenses and may disagree.
        </p>
      </div>
    </motion.div>
  );
}
