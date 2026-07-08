// Metrics-dictionary drift check (WO-ASA-006.1 req 3): fails the build if a
// metric tier/threshold literal reappears in a surface component instead of
// the dictionary. Run: npm run check:metrics
import { readFileSync } from 'node:fs';

const SURFACES = [
  'src/components/MetricsGuide.tsx',
  'src/components/MetricsGlossary.tsx',
];

// Tier-badge literals look like quoted strings starting with a comparator:
// '< 15 Excellent', '> 5%', '0.8–1.0'. After WO-ASA-006 these exist ONLY in
// src/lib/metricsDictionary.ts.
const FORBIDDEN = [
  // A complete quoted tier literal: '< 15 Excellent', "> 5%", '0.8–1.0 Caution'
  // (lookbehind restricts to string-literal starts, not JSX attribute ends)
  { re: /(?<=[:=,({[\s])['"][<>≥≤]\s?\d[^'"<>\n]*['"]/, why: 'quoted tier threshold outside the dictionary' },
  { re: /(?<=[:=,({[\s])['"]\d+(?:\.\d+)?–\d[^'"<>\n]*['"]/, why: 'quoted tier range outside the dictionary' },
  { re: /benchmarks=\{\[\s*\{\s*color:/, why: 'inline benchmark literals (render from METRICS)' },
  // Legacy per-metric tier objects (green: '< 15') — CSS class maps are fine
  { re: /(green|yellow|red):\s*['"][<>≥≤0-9]/, why: 'legacy tier object outside the dictionary' },
];

let violations = 0;
for (const file of SURFACES) {
  const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  if (!text.includes("from '../lib/metricsDictionary'")) {
    console.error(`DRIFT VIOLATION ${file}: does not import the metrics dictionary`);
    violations++;
  }
  text.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\{?\/?\*|<!--)/.test(line)) return;
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) {
        console.error(`DRIFT VIOLATION ${file}:${i + 1} [${why}]: ${line.trim().slice(0, 110)}`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n${violations} violation(s). Metric facts live ONLY in src/lib/metricsDictionary.ts.`);
  process.exit(1);
}
console.log('check:metrics — both surfaces render from the dictionary; no drift possible');
