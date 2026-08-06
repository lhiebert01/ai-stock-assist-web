// Acceptance check for WO-ASA-BLOG-NVO-001: the published essay must match the
// markdown source VERBATIM (whitespace-normalized). Extracts the <article> text
// from the page (live URL or local file), strips tags, and compares against the
// source md with markdown syntax removed.
//
// Usage:
//   node scripts/verify-blog-match.mjs                       # local build output
//   node scripts/verify-blog-match.mjs https://www.aistockassist.com/blog/every-signal-was-green

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'content/blog/nvo-essay-final.md');
const LOCAL = join(ROOT, 'public/blog/every-signal-was-green/index.html');

const normalize = (s) => s.replace(/\s+/g, ' ').trim();

// Source md → plain text: drop heading marker + emphasis markers.
const srcRaw = readFileSync(SOURCE, 'utf8');
const srcText = normalize(
  srcRaw
    .replace(/^#\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
);

// Page → plain text: take the <article> element, strip tags, decode entities.
const target = process.argv[2];
const html = target
  ? await (await fetch(target, { headers: { 'user-agent': 'asa-verify-blog-match' } })).text()
  : readFileSync(LOCAL, 'utf8');

const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
if (!articleMatch) {
  console.error('FAIL: no <article> element found');
  process.exit(1);
}
const pageText = normalize(
  articleMatch[1]
    .replace(/<div class="byline">[\s\S]*?<\/div>/, '') // byline is page chrome, not essay text
    .replace(/<figure[\s\S]*?<\/figure>/, '') // hero image
    // Strip tags to nothing: inline tags (<em>, <strong>) sit flush against
    // text, and block boundaries already have real newlines between them.
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&middot;/g, '·')
);

console.log(`source: ${SOURCE}`);
console.log(`source md5: ${createHash('md5').update(srcRaw).digest('hex')}`);
console.log(`page:   ${target || LOCAL}`);

if (pageText === srcText) {
  console.log('PASS: page text matches source verbatim (whitespace-normalized)');
} else {
  // Show the first divergence to make failures debuggable.
  let i = 0;
  while (i < Math.min(srcText.length, pageText.length) && srcText[i] === pageText[i]) i++;
  console.error('FAIL: text mismatch at offset', i);
  console.error('  source: …' + srcText.slice(Math.max(0, i - 40), i + 60) + '…');
  console.error('  page:   …' + pageText.slice(Math.max(0, i - 40), i + 60) + '…');
  process.exit(1);
}
