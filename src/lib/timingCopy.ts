/**
 * WO-ASA-TIMING-COPY Rev B — single source of truth for how timing signals are
 * PRESENTED (copy only; signal logic is unchanged upstream). The web TimingPanel
 * and the PDF report (DOM capture) render from here; the DOCX report mirrors
 * these strings in Python.
 *
 * Rules encoded here:
 * - State-dependent titles: a signal's visible title changes with its state so
 *   color always agrees with meaning (green title = good, amber = warning).
 * - Jargon names live ONLY in tooltips, never as visible titles.
 * - not_available signals are hidden; a per-card footnote counts what's checked.
 * - Chips: exit card → green "OK" / amber "WARNING"; entry card → green "YES" /
 *   neutral "NOT YET". Never the word "Clear".
 * - No imperative or predictive language; no probabilities.
 */
import type { TimingData, TimingCondition } from '../types/stock';

export const TOTAL_SIGNALS = 5; // signals tracked per card at full coverage
// "Recent trading range" — NOT "better-price range". The band is EMA(recent) ±
// a few %, i.e. WHERE the stock has been trading, not WHAT it's worth. The old
// name implied "a good price to pay", which then contradicted the fair-value
// signal ("no longer a bargain") on the same card. Renamed so the timing lens
// (where it trades) and the value lens (what it's worth) read as distinct.
export const ENTRY_ZONE_LABEL = 'Recent trading range';

export type ChipTone = 'ok' | 'warn' | 'yes' | 'muted';
export type CardKind = 'exit' | 'entry';

export interface SignalView {
  id: string;
  title: string;      // state-dependent, plain-language, color-agreeing
  chip: string;       // OK / WARNING / YES / NOT YET
  tone: ChipTone;
  evidence: string;   // plain-language line under the title
  tooltip: string;    // jargon name + short explanation (ⓘ only)
}

export interface HeaderView { title: string; body: string }

/** Price position relative to the better-price range (WO-ASA-QA-001 §1). */
export type PricePosition = 'above' | 'in' | 'below' | null;

/** Body copy for the not-yet-aligned entry state, driven by the ACTUAL price
 * position — never assumes "extended" (VERBATIM per WO-ASA-QA-001 §1). */
export function entryPositionBody(pos: PricePosition): string {
  switch (pos) {
    case 'above':
      return 'Price is above its recent trading range right now — a pullback toward that range would be a lower entry. Whether it is a good VALUE is a separate question — see the value signals below.';
    case 'in':
      return 'Price is within its recent trading range right now. That is a timing view only — whether it is a bargain on VALUE is shown separately in the signals below.';
    case 'below':
      return 'Price is below its recent trading range right now — the conditions not yet aligned are listed below.';
    default:
      return 'The conditions not yet aligned are listed below.';
  }
}

/** Header copy per state (color agrees with tone). For the not-aligned entry
 * state, `pos` selects position-accurate body copy — never "extended" on a
 * below-range price. */
export function headerView(state: string, pos: PricePosition = null): HeaderView {
  switch (state) {
    case 'WATCH':
      return {
        title: "What's the best entry price?",
        body: entryPositionBody(pos),
      };
    case 'ENTRY_WINDOW':
      return { title: 'Conditions for a reasonable entry are aligned.', body: '' };
    case 'HOLD':
      return { title: 'No warning signs.', body: '' };
    case 'TRIM_CONDITIONS_ELEVATED':
    case 'EXIT_CONDITIONS_ELEVATED':
      return { title: 'Several warning signs are on — worth reviewing this holding.', body: '' };
    case 'AVOID':
      return { title: 'The long-term trend is off and the rating is not attractive.', body: '' };
    default:
      return { title: 'Timing signals', body: '' };
  }
}

/** Jargon name for the ⓘ tooltip, per signal id. */
const TOOLTIP: Record<string, string> = {
  E1: 'Margin of safety — price vs. our framework’s estimate of the business’s worth.',
  E2: 'Thesis decay — whether the quality/value score is deteriorating.',
  E3: 'Trend regime — price vs. its long-term average and relative strength.',
  E4: 'Entry-anchored VWAP — average price paid since your tracking start, weighted by volume.',
  E5: 'Sector rotation — leadership rotating out of the sector.',
  N1: 'Verdict gate — whether the framework currently rates the stock attractive.',
  N2: 'Trend regime — price and relative strength are constructive.',
  N3: 'Pullback zone — price near its typical recent level rather than stretched above it.',
  N4: 'Event window — clearance from the next earnings date.',
};

// active = the exit warning is ON (bad) / the entry green light is ON (good).
function isActive(c: TimingCondition) { return c.status === 'active'; }

/** State-dependent title + chip for one EXIT signal (Card 1). */
function exitView(c: TimingCondition): SignalView {
  const on = isActive(c); // warning on
  const base = { id: c.id, evidence: c.evidence, tooltip: TOOLTIP[c.id] ?? c.label };
  const warn = (title: string): SignalView => ({ ...base, title, chip: 'WARNING', tone: 'warn' });
  const ok = (title: string): SignalView => ({ ...base, title, chip: 'OK', tone: 'ok' });
  switch (c.id) {
    case 'E1': return on ? warn('No longer a bargain') : ok('Still a bargain');
    case 'E3': return on ? warn('Downtrend') : ok('Long-term trend healthy');
    case 'E4': return on ? warn('Below your starting point') : ok('Holding above your starting point');
    case 'E2': return on ? warn('Quality slipping') : ok('Quality holding up');
    default:   return on ? warn(c.label) : ok(c.label);
  }
}

/** State-dependent title + chip for one ENTRY signal (Card 2). */
function entryView(c: TimingCondition): SignalView {
  const on = isActive(c); // green light on
  const base = { id: c.id, evidence: c.evidence, tooltip: TOOLTIP[c.id] ?? c.label };
  const yes = (title: string): SignalView => ({ ...base, title, chip: 'YES', tone: 'yes' });
  const no = (title: string): SignalView => ({ ...base, title, chip: 'NOT YET', tone: 'muted' });
  switch (c.id) {
    case 'N1': return on ? yes('Rated attractive') : no('Not currently rated attractive');
    case 'N2': return on ? yes('Long-term trend healthy') : no('Long-term trend soft');
    case 'N3': return on ? yes('Price not overstretched') : no('Price stretched above its usual level');
    case 'N4': return on ? yes('Clear of earnings') : no('Earnings are near');
    default:   return on ? yes(c.label) : no(c.label);
  }
}

/** Visible signals for a card (not_available hidden) + the k-of-n footnote. */
export function cardSignals(data: TimingData, kind: CardKind) {
  const conds = kind === 'exit' ? data.exit_conditions : data.entry_conditions;
  const visible = conds.filter((c) => c.status !== 'not_available');
  const views = visible.map((c) => (kind === 'exit' ? exitView(c) : entryView(c)));
  const hidden = conds.filter((c) => c.status === 'not_available');
  const shown = visible.length;
  const onCount = visible.filter((c) => c.status === 'active').length;
  // Honest k-of-n coverage — present tense only (never "coming soon").
  const footnote =
    shown < TOTAL_SIGNALS ? `Checking ${shown} of ${TOTAL_SIGNALS} signals` : '';
  const footnoteTip = hidden.length
    ? 'Not yet available: ' + hidden.map((c) => TOOLTIP[c.id] ?? c.label).join(' · ')
    : '';
  return { views, onCount, shown, footnote, footnoteTip };
}

export const CARD1_TITLE = (ticker: string) =>
  `What are considerations for exiting or selling ${ticker}?`;
export const CARD1_LEADIN =
  "If two or more of these warning signs are on, that's worth your attention.";
export const CARD1_COUNTER = (k: number, n: number) => `Warning signs · ${k} of ${n} on`;

export const CARD2_TITLE = (ticker: string) => `Signals to inform an entry into ${ticker}`;
export const CARD2_COUNTER = (k: number, n: number) => `Green lights · ${k} of ${n} on`;

export const PANEL_INTRO = (ticker: string) =>
  `Signals for ${ticker} — stock intelligence at a glance. Tap ⓘ on any signal for a ` +
  `quick explanation; the in-depth guide is in the Metrics Guide (Learn page).`;

export const BETA_TOOLTIP =
  'Beta feature — these signals are being tested; the validation study is in progress.';
