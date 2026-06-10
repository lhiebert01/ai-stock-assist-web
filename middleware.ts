// Vercel Edge Middleware — serve social crawlers a clean 200 (no Range/206).
//
// Why: our static-SPA index.html is served by Vercel with Range support, so when a
// crawler sends a Range header it gets `206 Partial Content`. LinkedIn reacts to the
// 206 by shrinking the OG image to a tiny `articleshare-shrink_160` thumbnail (fuzzy).
// A clean `200` yields the large `articleshare-shrink_480` rendition — verified against
// quizshowdown.live, which is SSR (200) and renders a sharp card with identical tags.
//
// Safety: only known crawler user-agents are intercepted; every real user returns
// `undefined` (normal serving) and any error falls through. The site cannot break for
// humans from this.

export const config = { matcher: '/' };

const CRAWLER_RE =
  /linkedinbot|twitterbot|facebookexternalhit|facebot|slackbot|whatsapp|telegrambot|discordbot|pinterest|redditbot|embedly|skypeuripreview/i;

export default async function middleware(request: Request): Promise<Response | undefined> {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!CRAWLER_RE.test(ua)) return undefined; // real users: normal static serving

    // Fetch the static document WITHOUT a Range header so the origin returns 200,
    // then hand the crawler a fresh 200 response.
    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}/index.html`, { headers: { 'user-agent': ua } });
    if (!res.ok) return undefined;
    const html = await res.text();
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch {
    return undefined; // any failure -> fall through to normal serving
  }
}
