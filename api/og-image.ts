import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Dynamic OG image rotation.
 *
 * Returns a 302 redirect to one of 5 OG images, rotating by day-of-year.
 * Weighted so the two best images appear more often:
 *   - og-image-2.jpg ("Invest Better Than a Pro") — 3 days/week
 *   - og-image-5.jpg ("Intelligence Era") — 2 days/week
 *   - og-image-1.jpg, og-image-3.jpg, og-image-4.jpg — 1 day each
 *
 * Social crawlers (Facebook, Twitter, LinkedIn) follow 302 redirects for images.
 */

const WEIGHTED_IMAGES = [
  '/og-image-2.jpg', // Mon — Invest Better Than a Pro
  '/og-image-5.jpg', // Tue — Intelligence Era
  '/og-image-1.jpg', // Wed — Desktop & Mobile (solo man)
  '/og-image-2.jpg', // Thu — Invest Better Than a Pro
  '/og-image-5.jpg', // Fri — Intelligence Era
  '/og-image-3.jpg', // Sat — Gradient brand
  '/og-image-4.jpg', // Sun — Check any stock
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
