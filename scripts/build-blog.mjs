// Blog page generator (WO-ASA-BLOG-NVO-001 T1/T2 + WO-ASA-BLOG-POLISH-002).
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
// POLISH-002: the header and footer are static replicas of the app's Navbar and
// Footer components (marketing variant — logo + Analyze/Learn/Blog + CTA; full
// Product/Learn/Connect footer with the subscribe block). If Navbar.tsx or
// Footer.tsx change materially, mirror the change here.
//
// Also emits /blog/feed.xml (Atom) from the POSTS registry.
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
// Founder-approved tagline (POLISH-002 T6): the essays are about investing,
// not about building the app.
const TAGLINE = 'Essays and hard-won lessons in disciplined investing.';

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
    // One file, two jobs: the og:image in the head AND the first in-body image
    // below the title — so every share card matches what readers see.
    ogImage: `/og/asa-every-signal-was-green-1200x630.jpg`,
    ogImageAlt:
      'Editorial chart: a climb to "$140 · ALL SIGNALS GREEN", then a two-year nosedive through floors at −20, −30, −40 and −50 percent — each marked "a fresh reason to hold" — an orange ejection seat at −55–60%, the line continuing to −70%. Footer: MY 50% CUSHION MET A 70% FLOOR.',
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

// ── Inline SVG icons (lucide paths, matching the app's icon set) ────────────
const svgIcon = (paths, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON_TRENDING = svgIcon('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>', 'ic');
const ICON_MAIL = svgIcon('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>', 'ic-sm');
const ICON_EXT = svgIcon('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>', 'ic-xs');
const ICON_HEART = svgIcon('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', 'ic-xs heart');

// ── Shared page chrome (static replica of the app's design system) ──────────
const CSS = `
:root {
  --surface-0: #0a0e1a; --surface-1: #0f1629; --surface-2: #151d35; --surface-3: #1b2541;
  --border: #1e293b; --text: #f1f5f9; --text-2: #94a3b8;
  /* WCAG AA: #64748b is only 4.04:1 on the near-black ground — lightened for 4.5+ */
  --muted: #8494a9;
  --accent: #22d3ee;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--surface-0); color: var(--text);
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; line-height: 1.7;
}
a { color: var(--accent); }
.ic { width: 20px; height: 20px; }
.ic-sm { width: 16px; height: 16px; }
.ic-xs { width: 12px; height: 12px; }
.heart { color: #f87171; fill: #f87171; }

/* ── Site header (marketing variant of the app Navbar) ── */
header.site {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in srgb, var(--surface-1) 80%, transparent);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
}
header.site .inner {
  max-width: 80rem; margin: 0 auto; padding: 0 24px; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); }
.brand .mark {
  width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; background: rgba(34, 211, 238, 0.15); color: var(--accent);
}
.brand .name { font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-links a {
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
  text-decoration: none; color: var(--text-2); transition: all 0.15s;
}
.nav-links a:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
.nav-links a.current { color: var(--accent); background: rgba(34, 211, 238, 0.1); }
.nav-cta {
  padding: 8px 16px; background: var(--accent); color: var(--surface-0);
  font-size: 14px; font-weight: 700; border-radius: 8px; text-decoration: none;
  white-space: nowrap;
}
.nav-cta:hover { filter: brightness(1.1); }
@media (max-width: 560px) { .brand .name { display: none; } .nav-links a { padding: 8px 10px; } }

/* ── Scroll progress (T5) ── */
#progress {
  position: fixed; top: 64px; left: 0; height: 2px; width: 0;
  background: var(--accent); z-index: 49; opacity: 0.8;
}

/* ── Article ── */
.wrap { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }
.crumbs { font-size: 13.5px; color: var(--muted); margin-bottom: 20px; }
.crumbs a { color: var(--text-2); text-decoration: none; }
.crumbs a:hover { color: var(--accent); }
h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); line-height: 1.25; font-weight: 800; margin: 0 0 16px; }
.byline { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 14px; margin-bottom: 28px; }
.byline .avatar {
  width: 36px; height: 36px; border-radius: 50%; flex: none;
  background: rgba(34, 211, 238, 0.2); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; letter-spacing: 0.02em;
}
.byline a { color: var(--text-2); font-weight: 600; }
figure.hero { margin: 0 0 36px; }
figure.hero img { width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--border); display: block; }
article { max-width: 68ch; }
article p { margin: 0 0 1.3em; font-size: 1.125rem; line-height: 1.7; color: #d7dee9; }
article strong { color: var(--text); }
.cta {
  margin-top: 48px; padding: 20px 24px; border: 1px solid var(--border);
  border-radius: 12px; background: var(--surface-1); font-size: 15px;
}
.cta a { color: var(--accent); font-weight: 600; }
.disclaimer { margin-top: 24px; color: var(--muted); font-size: 13px; line-height: 1.6; }

/* ── Blog index cards ── */
.post-card {
  display: block; border: 1px solid var(--border); border-radius: 12px;
  overflow: hidden; background: var(--surface-1); text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.post-card:hover {
  border-color: var(--accent); transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(34, 211, 238, 0.08);
}
.post-card img { width: 100%; height: auto; display: block; border-bottom: 1px solid var(--border); }
.post-card .pad { padding: 22px 24px; }
.post-card h2 { margin: 0 0 8px; font-size: 1.2rem; color: var(--text); line-height: 1.35; }
.post-card p { margin: 0; color: var(--text-2); font-size: 14px; }
.post-card .date { color: var(--muted); font-size: 12.5px; margin-top: 10px; display: block; }

/* ── Site footer (static replica of the app Footer) ── */
footer.site { border-top: 1px solid var(--border); margin-top: 80px; }
footer.site .inner { max-width: 72rem; margin: 0 auto; padding: 48px 24px; }
.sub-block {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 20px; padding-bottom: 40px; margin-bottom: 40px; border-bottom: 1px solid var(--border);
}
/* Card variant for the blog index (below the post cards) */
.sub-block.as-card {
  border: 1px solid var(--border); border-radius: 12px; background: var(--surface-1);
  padding: 24px; margin: 28px 0 0;
}
.sub-block h4 { font-size: 16px; font-weight: 700; margin: 0 0 4px; }
.sub-block p { font-size: 14px; color: var(--text-2); margin: 0; max-width: 28rem; }
.sub-form { display: flex; gap: 12px; flex-wrap: wrap; }
.sub-form .field { position: relative; }
.sub-form .field svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); }
.sub-form input {
  padding: 10px 12px 10px 36px; min-width: 230px; border-radius: 12px;
  background: var(--surface-3); border: 1px solid var(--border); color: var(--text);
  font-size: 14px; font-family: inherit;
}
.sub-form input::placeholder { color: var(--muted); }
.sub-form input:focus { outline: none; border-color: rgba(34, 211, 238, 0.5); }
.sub-form button {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
  background: var(--accent); color: #000; font-weight: 700; font-size: 14px;
  border: none; border-radius: 12px; cursor: pointer; font-family: inherit;
}
.sub-form button:hover { opacity: 0.9; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 40px; }
@media (max-width: 640px) { .cols { grid-template-columns: 1fr; } }
.cols h4 {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--muted); margin: 0 0 16px;
}
.cols ul { list-style: none; margin: 0; padding: 0; }
.cols li { margin-bottom: 10px; }
.cols a {
  color: var(--text-2); text-decoration: none; font-size: 14px;
  display: inline-flex; align-items: center; gap: 4px;
}
.cols a:hover { color: #fff; }
.eco {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
  column-gap: 24px; row-gap: 8px; padding-bottom: 32px; border-bottom: 1px solid var(--border);
}
.eco .lbl { font-size: 12px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.eco a { font-size: 12px; color: var(--text-2); text-decoration: none; }
.eco a:hover { color: var(--accent); }
.legal { margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.legal .brandrow { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; }
.legal .brandrow svg { color: var(--accent); }
.legal .links { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--muted); }
.legal .links a { color: var(--muted); text-decoration: none; }
.legal .links a:hover { color: #fff; }
.legal .copy { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 4px; margin: 0; }
.compliance { margin-top: 24px; text-align: center; }
.compliance p { font-size: 12px; color: var(--muted); line-height: 1.6; max-width: 42rem; margin: 0 auto; }
`;

// T1 — marketing variant of the app nav: logo + Analyze / Learn / Blog + CTA.
const siteHeader = (current) => `
<header class="site"><div class="inner">
  <a class="brand" href="/">
    <span class="mark">${ICON_TRENDING}</span>
    <span class="name">AI Stock Assist</span>
  </a>
  <nav class="nav-links" aria-label="Site">
    <a href="/">Analyze</a>
    <a href="/?view=learn">Learn</a>
    <a href="/blog/"${current === 'blog' ? ' class="current" aria-current="page"' : ''}>Blog</a>
  </nav>
  <a class="nav-cta" href="/">Analyze Stocks</a>
</div></header>
<div id="progress" aria-hidden="true"></div>`;

// T5 — 2px scroll-progress line under the nav (accent, minimal; no library).
const progressScript = `
<script>
(function () {
  var bar = document.getElementById('progress');
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
</script>`;

// Subscribe block — shared between the footer and the blog index (T6: the
// index page's second element is an action, not blank space).
const subscribeBlock = (extraClass = '') => `
  <div class="sub-block${extraClass ? ' ' + extraClass : ''}">
    <div>
      <h4>Invest wealthier and wiser</h4>
      <p>Free, story-driven investing lessons in your inbox — the <strong>Intelligence Era</strong> series.</p>
    </div>
    <form class="sub-form" action="https://lindsayhiebert.substack.com/subscribe" method="get" target="_blank" rel="noopener noreferrer">
      <span class="field">${ICON_MAIL}<input type="email" name="email" required placeholder="you@email.com" aria-label="Email address" /></span>
      <button type="submit">Subscribe Free ${ICON_EXT}</button>
    </form>
  </div>`;

// T2 — static replica of the app Footer (Product / Learn / Connect + subscribe
// block + AI for Good strip + compliance disclaimer). Copy mirrors Footer.tsx.
const siteFooter = `
<footer class="site"><div class="inner">
${subscribeBlock()}

  <div class="cols">
    <div>
      <h4>Product</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/">Analyze Stocks</a></li>
        <li><a href="/">Stock Discovery</a></li>
        <li><a href="/">Buy Credits</a></li>
      </ul>
    </div>
    <div>
      <h4>Learn</h4>
      <ul>
        <li><a href="https://lindsayhiebert.substack.com/s/investing-in-the-intelligence-era" target="_blank" rel="noopener noreferrer">Substack Blog ${ICON_EXT}</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/?view=metrics">Metrics Guide</a></li>
        <li><a href="/?view=learn">Learn to Invest</a></li>
      </ul>
    </div>
    <div>
      <h4>Connect</h4>
      <ul>
        <li><a href="https://x.com/aistockassist" target="_blank" rel="noopener noreferrer">Twitter / X ${ICON_EXT}</a></li>
        <li><a href="https://www.linkedin.com/in/lindsayhiebert/" target="_blank" rel="noopener noreferrer">LinkedIn ${ICON_EXT}</a></li>
        <li><a href="https://www.linkedin.com/in/lindsayhiebert/" target="_blank" rel="noopener noreferrer">Contact ${ICON_EXT}</a></li>
      </ul>
    </div>
  </div>

  <div class="eco">
    <span class="lbl">AI for Good:</span>
    <a href="https://aistockassist.com" target="_blank" rel="noopener noreferrer">AI Stock Assist</a>
    <a href="https://www.getmacrolens.com" target="_blank" rel="noopener noreferrer">Macro Lens</a>
    <a href="https://neoaesop.com" target="_blank" rel="noopener noreferrer">Neo-Aesop</a>
    <a href="https://heroicverse.app" target="_blank" rel="noopener noreferrer">HeroicVerse</a>
    <a href="https://affirm.neoaesop.com" target="_blank" rel="noopener noreferrer">iAppreciateYou</a>
  </div>

  <div class="legal">
    <div class="brandrow">${ICON_TRENDING}<span>AI Stock Assist</span></div>
    <div class="links">
      <a href="/?view=privacy">Privacy Policy</a>
      <span>|</span>
      <a href="/?view=terms">Terms of Service</a>
    </div>
    <p class="copy">&copy; ${new Date().getFullYear()} AI Stock Assist. Built with ${ICON_HEART} by Lindsay Hiebert. All rights reserved.</p>
  </div>

  <div class="compliance">
    <p>AI Stock Assist provides AI-generated analysis for educational purposes only.
    This is not financial advice and not a prediction. Always do your own research before making investment decisions.
    Past performance does not guarantee future results.</p>
  </div>
</div></footer>`;

function page({ title, description, canonical, head = '', body, current }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" type="application/atom+xml" title="AI Stock Assist Blog" href="${SITE}/blog/feed.xml" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta name="theme-color" content="#0f172a" />
<link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
${head}
<style>${CSS}</style>
</head>
<body>
${siteHeader(current)}
${body}
${siteFooter}
${progressScript}
</body>
</html>
`;
}

// ── Build each post ─────────────────────────────────────────────────────────
const indexEntries = [];
const feedEntries = [];

for (const post of POSTS) {
  if (post.metaTitle.length >= 60) throw new Error(`Meta title too long (${post.metaTitle.length})`);
  if (post.metaDescription.length >= 155) throw new Error(`Meta description too long (${post.metaDescription.length})`);

  const src = readFileSync(join(ROOT, post.source), 'utf8');
  const md5 = createHash('md5').update(src).digest('hex');
  const { title, bodyHtml } = mdToHtml(src);
  const canonical = `${SITE}/blog/${post.slug}`;
  const ogImageAbs = `${SITE}${post.ogImage}`;
  const words = src.split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(words / 200));
  const dateHuman = new Date(post.datePublished + 'T12:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
        wordCount: words,
        timeRequired: `PT${readMins}M`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE}/blog/` },
          { '@type': 'ListItem', position: 2, name: post.headline, item: canonical },
        ],
      },
    ],
  };

  const head = `
<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${escapeHtml(post.metaTitle)}" />
<meta property="og:description" content="${escapeHtml(post.metaDescription)}" />
<meta property="og:image" content="${ogImageAbs}" />
<meta property="og:image:type" content="${post.ogImage.endsWith('.jpg') ? 'image/jpeg' : 'image/png'}" />
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

  // T3 — byline: avatar + name + date + reading time. The byline and figure are
  // page chrome (excluded from the verbatim text match); the essay body itself
  // renders VERBATIM. T3 (single CTA, last position) then the disclaimer.
  const body = `
<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/blog/">Blog</a> <span aria-hidden="true">→</span> ${escapeHtml(post.headline)}</nav>
  <article id="essay">
    <h1>${inline(title)}</h1>
    <div class="byline">
      <span class="avatar" aria-hidden="true">LH</span>
      <span>By <a href="https://www.linkedin.com/in/lindsayhiebert/" rel="author">Lindsay Hiebert</a> &middot; ${dateHuman} &middot; ~${readMins} min read</span>
    </div>
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
  writeFileSync(join(outDir, 'index.html'), page({ title: post.metaTitle, description: post.metaDescription, canonical, head, body, current: 'blog' }));
  console.log(`built /blog/${post.slug}  (source md5 ${md5}, ~${readMins} min read)`);

  indexEntries.push(`
  <a class="post-card" href="/blog/${post.slug}">
    <img src="${post.ogImage}" alt="" width="1200" height="630" loading="lazy" />
    <span class="pad">
      <h2>${inline(title)}</h2>
      <p>${escapeHtml(post.metaDescription)}</p>
      <span class="date">${dateHuman} &middot; Lindsay Hiebert &middot; ~${readMins} min read</span>
    </span>
  </a>`);

  feedEntries.push(`  <entry>
    <title>${escapeHtml(title)}</title>
    <id>${canonical}</id>
    <link rel="alternate" type="text/html" href="${canonical}"/>
    <published>${post.datePublished}T12:00:00Z</published>
    <updated>${post.datePublished}T12:00:00Z</updated>
    <author><name>Lindsay Hiebert</name></author>
    <summary>${escapeHtml(post.metaDescription)}</summary>
    <content type="html">${escapeHtml(`<img src="${ogImageAbs}" alt=""/>\n` + bodyHtml)}</content>
  </entry>`);
}

// ── Blog index ──────────────────────────────────────────────────────────────
// T6: Blog + ItemList schema so the index is machine-readable.
const indexJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': `${SITE}/blog/`,
      name: 'AI Stock Assist Blog',
      description: TAGLINE,
      url: `${SITE}/blog/`,
      publisher: { '@type': 'Organization', name: 'AI Stock Assist', url: `${SITE}/` },
      blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.headline, url: `${SITE}/blog/${p.slug}` })),
    },
    {
      '@type': 'ItemList',
      itemListElement: POSTS.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.headline, url: `${SITE}/blog/${p.slug}`,
      })),
    },
  ],
};

const indexBody = `
<main class="wrap">
  <h1>Blog</h1>
  <div class="byline"><span>${escapeHtml(TAGLINE)}</span></div>
  ${indexEntries.join('\n')}
${subscribeBlock('as-card')}
</main>`;

mkdirSync(join(ROOT, 'public', 'blog'), { recursive: true });
writeFileSync(
  join(ROOT, 'public', 'blog', 'index.html'),
  page({
    title: 'Blog — AI Stock Assist',
    description: TAGLINE,
    canonical: `${SITE}/blog/`,
    head: `<script type="application/ld+json">\n${JSON.stringify(indexJsonLd, null, 2)}\n</script>`,
    body: indexBody,
    current: 'blog',
  })
);
console.log('built /blog/ index');

// ── Atom feed (T4) ──────────────────────────────────────────────────────────
const newest = POSTS.map((p) => p.datePublished).sort().at(-1);
const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AI Stock Assist Blog</title>
  <subtitle>${TAGLINE}</subtitle>
  <id>${SITE}/blog/</id>
  <link rel="alternate" type="text/html" href="${SITE}/blog/"/>
  <link rel="self" type="application/atom+xml" href="${SITE}/blog/feed.xml"/>
  <updated>${newest}T12:00:00Z</updated>
  <author><name>Lindsay Hiebert</name></author>
${feedEntries.join('\n')}
</feed>
`;
writeFileSync(join(ROOT, 'public', 'blog', 'feed.xml'), feed);
console.log('built /blog/feed.xml');
