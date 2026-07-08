/**
 * Segment/brand-name aliases (WO-ASA-001.2). "AWS" once rendered a full stock
 * card of N/A values stamped SELL — segment names must be intercepted at the
 * input with a confirmation ("AWS is a segment of Amazon.com (AMZN). Analyze
 * AMZN instead?") before any server call or credit spend.
 *
 * Mirror of the backend map in ai-stock-render/api/lib/symbols.py — keep the
 * two in sync (the backend enforces it again as defense in depth).
 */
export const SEGMENT_ALIASES: Record<string, { ticker: string; note: string }> = {
  AWS: { ticker: 'AMZN', note: 'Amazon Web Services is a business segment of Amazon.com' },
  YOUTUBE: { ticker: 'GOOGL', note: 'YouTube is a business segment of Alphabet' },
  INSTAGRAM: { ticker: 'META', note: 'Instagram is a business segment of Meta Platforms' },
  WHATSAPP: { ticker: 'META', note: 'WhatsApp is a business segment of Meta Platforms' },
  AZURE: { ticker: 'MSFT', note: 'Azure is a business segment of Microsoft' },
  WAYMO: { ticker: 'GOOGL', note: 'Waymo is a subsidiary of Alphabet' },
  GOOGLE: { ticker: 'GOOGL', note: 'Google trades as Alphabet' },
  FACEBOOK: { ticker: 'META', note: 'Facebook trades as Meta Platforms' },
};
