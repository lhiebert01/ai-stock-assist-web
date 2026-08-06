// Claims-register enforcement (WO-ASA-002.17): grep marketing surfaces for
// prohibited value-claim framings. Run: npm run check:claims
// Prohibitions live in CLAIMS-REGISTER.md — keep the two in sync.
import { readFileSync } from 'node:fs';

const SURFACES = [
  'src/components/MarketingLanding.tsx',
  'src/components/Payments.tsx',
  'src/components/LearnPage.tsx',
  'src/components/Footer.tsx',
  'src/components/SEO.tsx',
  'src/components/MetricsGuide.tsx',
  'index.html',
  // Blog chrome (header/footer/CTA copy) — the verbatim essay bodies live in
  // content/blog/ and are personal essays, not marketing surfaces.
  'scripts/build-blog.mjs',
  // Campaign copy that publishes outside the app (relaunch series + social).
  // Meta-docs about the campaign (the work order, the readiness review) are
  // deliberately excluded — they quote prohibited terms in order to ban them.
  'docs/relaunch/ANNOUNCE-relaunch.md',
  'docs/relaunch/IMAGE-PROMPTS-SERIES.md',
  'docs/relaunch/POST-1-one-card-one-clock-social-COPY-PASTE.md',
  'docs/relaunch/POST-2-always-an-answer-social-COPY-PASTE.md',
  'docs/relaunch/POST-3-the-bridge-social-COPY-PASTE.md',
];

// Patterns are product-claim framings; plain-English disclaimers ("does not
// guarantee future results", "not predictions") are explicitly allowed.
const PROHIBITED = [
  { re: /beats? the market/i, why: 'market-beating claim' },
  // Negated/disclaimer uses ("not predictions", "None of them predicts
  // anything", "never claims to predict") are compliant — skip lines with a
  // negation anywhere.
  { re: /\bpredicts?\b/i, why: 'predictive claim (unless negated as a disclaimer)', unlessLine: /\b(not|none|never|no)\b|n't/i },
  { re: /money-?back guarantee/i, why: 'guarantee without fulfillment flow (WO-ASA-002.14)' },
  { re: /\bguaranteed\b/i, why: 'outcome guarantee' },
  { re: /#1\b/, why: 'superlative' },
  { re: /most accurate/i, why: 'superlative' },
  { re: /\bbest\s+(stock|analysis|tool|app|platform)/i, why: 'product superlative' },
  { re: /act now|don'?t miss|limited time/i, why: 'urgency framing' },
  { re: /beats graham|outperforms?\b/i, why: 'outcome-superiority claim (MVQ addendum)' },
  { re: /\bsuperior\b/i, why: 'superiority claim (MVQ addendum)' },
];

let violations = 0;
for (const file of SURFACES) {
  let text;
  try {
    text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  } catch {
    continue;
  }
  text.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\{?\/?\*|<!--)/.test(line)) return; // comments (incl. JSX {/* ... */}) may cite prohibited terms
    for (const { re, why, unlessLine } of PROHIBITED) {
      if (unlessLine && unlessLine.test(line)) continue;
      if (re.test(line)) {
        console.error(`CLAIMS VIOLATION ${file}:${i + 1} [${why}]: ${line.trim().slice(0, 120)}`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n${violations} violation(s). See CLAIMS-REGISTER.md.`);
  process.exit(1);
}
console.log('check:claims — all marketing surfaces conform to CLAIMS-REGISTER.md');
