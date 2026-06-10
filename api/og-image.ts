import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dynamic OG image rotation.
 *
 * Returns a 302 redirect to one of 5 OG cards, rotating by day-of-week.
 * Refreshed Jun 2026: all cards are model-accurate ("Powered by Gemini 3.5 Flash")
 * and weighted to feature the new primary headline most often:
 *   - og-image-1.jpg ("Know What You Own Before You Buy") — 3 days/week (primary headline)
 *   - og-image-2.jpg ("Invest Better Than a Pro") — 1 day
 *   - og-image-3.jpg ("Deep Stock Research & Thinking") — 1 day
 *   - og-image-4.jpg ("Check any stock's honesty in 30 seconds") — 1 day
 *   - og-image-5.jpg ("Stock Analysis for Smarter Decisions") — 1 day
 *
 * NOTE: LinkedIn (and often Facebook) do NOT follow a 302 on og:image, so they fall
 * back to a cached static image. For guaranteed LinkedIn rendering, point og:image at
 * a direct static .jpg (recommended: /og-image-1.jpg) instead of this endpoint.
 */

const WEIGHTED_IMAGES = [
  '/og-image-1.jpg', // Mon — Know What You Own Before You Buy (primary)
  '/og-image-2.jpg', // Tue — Invest Better Than a Pro
  '/og-image-3.jpg', // Wed — Deep Stock Research & Thinking
  '/og-image-1.jpg', // Thu — Know What You Own Before You Buy (primary)
  '/og-image-5.jpg', // Fri — Stock Analysis for Smarter Decisions
  '/og-image-4.jpg', // Sat — Check any stock's honesty in 30 seconds
  '/og-image-1.jpg', // Sun — Know What You Own Before You Buy (primary)
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const dayOfWeek = new Date().getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Shift so index 0=Mon: (dayOfWeek + 6) % 7
  const index = (dayOfWeek + 6) % 7;
  const image = WEIGHTED_IMAGES[index];

  const baseUrl = 'https://www.aistockassist.com';

  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Location', `${baseUrl}${image}`);
  res.status(302).end();
}
