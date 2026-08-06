// Blog page generator (WO-ASA-BLOG-NVO-001 T1/T2).
//
// Converts content/blog/*.md VERBATIM into static HTML pages under public/blog/,
// so each post is a real crawlable URL with its own canonical, meta, and Article
// JSON-LD — something the routerless SPA cannot provide. Vercel serves static
// files before the /(.*) -> /index.html rewrite, so /blog/<slug> just works.
//
// Runs as part of `npm run build` (before vite build) so the published page can
// never drift from the markdown source. The acceptance test for the NVO essay is
// a whitespace-normalized text match against the source md — this script renders
// the source verbatim (no rewriting, no "improving") to keep that guarantee.
//
// Markdown subset: `# ` heading, blank-line-separated paragraphs, **bold**,
// *italic*. That is everything the essay uses; anything fancier should fail
// loudly rather than render wrong.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.aistockassist.com';

// ── Post registry ───────────────────────────────────────────────────────────
const POSTS = [
  {
    slug: 'every-signal-was-green',
    source: 'content/blog/nvo-essay-final.md',
    metaTitle: 'Every Signal Was Green: My NVO Loss and 3 Rules', // < 60 chars
    // < 155 chars, first-person, factual, no hype, no prices.
    metaDescription:
      'My thesis was right, every signal stayed green, and I still lost 55–60% on a blue chip. What the ride taught me — and the three rules that came out of it.',
    // Article headline (Google recommends <= 110 chars; the full essay title is
    // longer, so it rides along as alternativeHeadline).
    headline: 'Every signal was green. My blue chip nosedived anyway.',
    datePublished: '2026-08-06',
    ogImage: `/blog/every-signal-was-green/og.png`,
    ogImageAlt:
      'Flat-vector infographic: a stock nosedive path crossing floor markers at 20, 30, 40 and 50 percent down, with an ejection-seat marker at 55–60 percent.',
  },
];

// ── Minimal markdown → HTML (verbatim; subset only) ─────────────────────────
function escapeHtml(s) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function inline(s) {
  // Escape first, then bold before italic so ** never half-matches as *.
  let out = escapeHtml(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  if (out.includes('*')) {
    throw new Error(`Unbalanced emphasis marker in: ${s.slice(0, 80)}`);
  }
  return out;
}

function mdToHtml(md) {
  const blocks = md.trim().split(/\n\s*\n/);
  let title = null;
  const body = [];
  for (const block of blocks) {
    const text = block.trim();
    if (text.startsWith('# ')) {
      title = text.slice(2).trim();
      continue; // rendered separately as the <h1>
    }
    if (/^#{2,}\s/.test(text) || /^[-*]\s/m.test(text) || text.startsWith('>')) {
      throw new Error(`Markdown feature not supported by this generator: ${text.slice(0, 60)}`);
    }
    body.push(`<p>${inline(text.replace(/\n/g, ' '))}</p>`);
  }
  if (!title) throw new Error('Post has no # title');
  return { title, bodyHtml: body.join('\n') };
}

// ── Shared page chrome (ASA design system, self-contained CSS) ──────────────
const CSS = `
:root {
  --surface-0: #0a0e1a; --surface-1: #0f1629; --surface-3: #1b2541;
  --border: #1e293b; --text: #f1f5f9; --text-2: #94a3b8;
  /* WCAG AA: #64748b is only 4.04:1 on the near-black ground — lightened for 4.5+ */
  --muted: #8494a9;
  --accent: #22d3ee; --sell: #ef4444;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--surface-0); color: var(--text);
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; line-height: 1.7;
}
.wrap { max-width: 720px; margin: 0 auto; padding: 0 20px 64px; }
header.site {
  border-bottom: 1px solid var(--border); padding: 16px 20px; margin-bottom: 40px;
}
header.site .inner { max-width: 720px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
header.site a { color: var(--text); text-decoration: none; font-weight: 700; font-size: 15px; }
header.site a.app { color: var(--accent); font-weight: 600; font-size: 14px; }
h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.25; font-weight: 800; margin: 0 0 12px; }
.byline { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
.byline a { color: var(--text-2, #94a3b8); }
figure.hero { margin: 0 0 36px; }
figure.hero img { width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--border); display: block; }
article p { margin: 0 0 1.25em; font-size: 1.0625rem; color: #d7dee9; }
article strong { color: var(--text); }
.cta {
  margin-top: 48px; padding: 20px 24px; border: 1px solid var(--border);
  border-radius: 12px; background: var(--surface-1); font-size: 15px;
}
.cta a { color: var(--accent); font-weight: 600; }
.disclaimer { margin-top: 24px; color: var(--muted); font-size: 13px; line-height: 1.6; }
footer.site { border-top: 1px solid var(--border); margin-top: 56px; padding: 24px 20px; }
footer.site .inner { max-width: 720px; margin: 0 auto; color: var(--muted); font-size: 13px; }
footer.site a { color: var(--text-2, #94a3b8); }
/* index page */
.post-card { display: block; border: 1px solid var(--border); border-radius: 12px; padding: 22px 24px; background: var(--surface-1); text-decoration: none; }
.post-card:hover { border-color: var(--accent); }
.post-card h2 { margin: 0 0 8px; font-size: 1.2rem; color: var(--text); line-height: 1.35; }
.post-card p { margin: 0; color: var(--text-2, #94a3b8); font-size: 14px; }
.post-card .date { color: var(--muted); font-size: 12.5px; margin-top: 10px; display: block; }
`;

const header = `
<header class="site"><div class="inner">
  <a href="/">AI Stock Assist</a>
  <nav><a class="app" href="/blog/">Blog</a></nav>
</div></header>`;

const footer = `
<footer class="site"><div class="inner">
  &copy; ${new Date().getFullYear()} AI Stock Assist &middot; <a href="/">aistockassist.com</a> &middot; <a href="/?view=privacy">Privacy</a> &middot; <a href="/?view=terms">Terms</a>
</div></footer>`;

function page({ title, description, canonical, head = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="theme-color" content="#0f172a" />
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
${head}
<style>${CSS}</style>
</head>
<body>
${header}
${body}
${footer}
</body>
</html>
`;
}

// ── Build each post ─────────────────────────────────────────────────────────
const indexEntries = [];

for (const post of POSTS) {
  if (post.metaTitle.length >= 60) throw new Error(`Meta title too long (${post.metaTitle.length})`);
  if (post.metaDescription.length >= 155) throw new Error(`Meta description too long (${post.metaDescription.length})`);

  const src = readFileSync(join(ROOT, post.source), 'utf8');
  const md5 = createHash('md5').update(src).digest('hex');
  const { title, bodyHtml } = mdToHtml(src);
  const canonical = `${SITE}/blog/${post.slug}`;
  const ogImageAbs = `${SITE}${post.ogImage}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.headline,
    alternativeHeadline: title,
    description: post.metaDescription,
    author: {
      '@type': 'Person',
      name: 'Lindsay Hiebert',
      url: 'https://www.linkedin.com/in/lindsayhiebert/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Stock Assist',
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: `${SITE}/icons/favicon.svg` },
    },
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    image: ogImageAbs,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  const head = `
<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${escapeHtml(post.metaTitle)}" />
<meta property="og:description" content="${escapeHtml(post.metaDescription)}" />
<meta property="og:image" content="${ogImageAbs}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(post.ogImageAlt)}" />
<meta property="og:site_name" content="AI Stock Assist" />
<meta property="article:published_time" content="${post.datePublished}" />
<meta property="article:author" content="Lindsay Hiebert" />
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(post.metaTitle)}" />
<meta name="twitter:description" content="${escapeHtml(post.metaDescription)}" />
<meta name="twitter:image" content="${ogImageAbs}" />
<meta name="twitter:site" content="@aistockassist" />
<meta name="twitter:creator" content="@Lindsay_Hiebert" />
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
<!-- source md5: ${md5} (content/blog/${post.source.split('/').pop()}) -->`;

  // T3 — single CTA, last position only, then the disclaimer.
  const body = `
<main class="wrap">
  <article id="essay">
    <h1>${inline(title)}</h1>
    <div class="byline">By <a href="https://www.linkedin.com/in/lindsayhiebert/" rel="author">Lindsay Hiebert</a> &middot; ${new Date(post.datePublished + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</div>
    <figure class="hero"><img src="${post.ogImage}" alt="${escapeHtml(post.ogImageAlt)}" width="1200" height="630" /></figure>
${bodyHtml}
  </article>
  <div class="cta">
    The exit and entry conditions in this essay are now built into <a href="/?view=metrics">AI Stock Assist's sell-discipline framework</a>.
  </div>
  <p class="disclaimer">This essay describes my personal experience. It is not investment advice, and it is not a recommendation to buy or sell any security. Always do your own research before making investment decisions.</p>
</main>`;

  const outDir = join(ROOT, 'public', 'blog', post.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), page({ title: post.metaTitle, description: post.metaDescription, canonical, head, body }));
  console.log(`built /blog/${post.slug}  (source md5 ${md5})`);

  indexEntries.push(`
  <a class="post-card" href="/blog/${post.slug}">
    <h2>${inline(title)}</h2>
    <p>${escapeHtml(post.metaDescription)}</p>
    <span class="date">${post.datePublished} &middot; Lindsay Hiebert</span>
  </a>`);
}

// ── Blog index ──────────────────────────────────────────────────────────────
const indexBody = `
<main class="wrap">
  <h1>Blog</h1>
  <div class="byline">Essays and lessons from building AI Stock Assist.</div>
  ${indexEntries.join('\n')}
</main>`;

mkdirSync(join(ROOT, 'public', 'blog'), { recursive: true });
writeFileSync(
  join(ROOT, 'public', 'blog', 'index.html'),
  page({
    title: 'Blog — AI Stock Assist',
    description: 'Essays and lessons from building AI Stock Assist: sell discipline, entry timing, and investing in the intelligence era.',
    canonical: `${SITE}/blog/`,
    body: indexBody,
  })
);
console.log('built /blog/ index');
