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
];

// Patterns are product-claim framings; plain-English disclaimers ("does not
// guarantee future results", "not predictions") are explicitly allowed.
const PROHIBITED = [
  { re: /beats? the market/i, why: 'market-beating claim' },
  { re: /\bpredicts?\b(?![^.]*not)/i, why: 'predictive claim (unless negated as a disclaimer)' },
  { re: /money-?back guarantee/i, why: 'guarantee without fulfillment flow (WO-ASA-002.14)' },
  { re: /\bguaranteed\b/i, why: 'outcome guarantee' },
  { re: /#1\b/, why: 'superlative' },
  { re: /most accurate/i, why: 'superlative' },
  { re: /\bbest\s+(stock|analysis|tool|app|platform)/i, why: 'product superlative' },
  { re: /act now|don'?t miss|limited time/i, why: 'urgency framing' },
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
    for (const { re, why } of PROHIBITED) {
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
