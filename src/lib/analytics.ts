/**
 * Analytics — thin wrapper over Vercel Web Analytics custom events.
 *
 * Three goal events carry the relaunch funnel (see docs/relaunch/WO-RELAUNCH-CLAUDE-CODE.md §0.5):
 *   signup             — a brand-new account was created (fires once per user)
 *   first_analysis_run — that account's FIRST successful analysis (the activation moment)
 *   purchase           — returned from Stripe checkout successfully
 *
 * Every event carries the campaign attribution captured on the visitor's first
 * landing (utm_source / utm_medium / utm_campaign), so we can answer "which post
 * drove this signup?" rather than just "how many signups?".
 *
 * Never send PII: no email, no user id, no ticker the user typed.
 */
import { track as vercelTrack } from '@vercel/analytics';

const UTM_KEY = 'asa_utm';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

type Attribution = Partial<Record<(typeof UTM_FIELDS)[number], string>>;

/**
 * Capture UTM params on first load and persist them for the session. Campaign
 * links land on "/" with the tags, but signup/purchase happen many clicks later
 * and after `history.replaceState` has cleaned the URL — so we stash them early.
 */
export function initAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const field of UTM_FIELDS) {
      const value = params.get(field);
      if (value) found[field] = value.slice(0, 80);
    }
    // First touch wins — don't let an internal navigation overwrite the real source.
    if (Object.keys(found).length > 0 && !sessionStorage.getItem(UTM_KEY)) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    }
  } catch {
    // Private mode / storage disabled — attribution is best-effort, never fatal.
  }
}

function attribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

export function track(event: string, props: Record<string, string | number | boolean> = {}): void {
  try {
    vercelTrack(event, { ...attribution(), ...props });
  } catch (err) {
    // Analytics must never break a user flow.
    console.warn('[Analytics] track failed:', event, err);
  }
}

/**
 * Fire an event at most once per browser, keyed by name. Used for `signup` and
 * `first_analysis_run`, which are milestones — a re-render or a second tab must
 * not double-count them.
 */
export function trackOnce(event: string, props: Record<string, string | number | boolean> = {}): void {
  const key = `asa_once_${event}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
  } catch {
    // Storage unavailable — better to send a possible duplicate than to lose the goal.
  }
  track(event, props);
}
