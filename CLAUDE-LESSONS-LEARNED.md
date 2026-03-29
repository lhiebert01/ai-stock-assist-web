# CLAUDE-LESSONS-LEARNED.md
# AI Stock Assist — 24-Hour Build Sprint: Every Bug, Fix & Deployment Lesson

**Date:** 2026-03-29
**Project:** AI Stock Assist (aistockassist.com)
**Stack:** React 19 + TypeScript + Vite 6 + Tailwind v4 + Supabase + Stripe + Render + Vercel

---

## Table of Contents

1. [Architecture Quick Reference](#1-architecture-quick-reference)
2. [Critical Bugs Fixed (Ordered by Severity)](#2-critical-bugs-fixed)
3. [Deployment Fixes & Infrastructure Issues](#3-deployment-fixes)
4. [CSS / UI / UX Fixes](#4-css-ui-ux-fixes)
5. [Feature Implementation Lessons](#5-feature-implementation-lessons)
6. [React State Management Gotchas](#6-react-state-management-gotchas)
7. [Supabase Auth & Database Patterns](#7-supabase-auth--database-patterns)
8. [Render Backend (FastAPI) Patterns](#8-render-backend-patterns)
9. [Stripe Payment Integration](#9-stripe-payment-integration)
10. [SPA Navigation Patterns (No React Router)](#10-spa-navigation-patterns)
11. [Component Checklist (New Component Wiring)](#11-component-checklist)
12. [Theme & Styling Patterns](#12-theme--styling-patterns)
13. [SEO & Meta Tags](#13-seo--meta-tags)
14. [Testing & Verification Checklist](#14-testing--verification-checklist)
15. [Common User Mistakes to Anticipate](#15-common-user-mistakes)
16. [File Quick Reference](#16-file-quick-reference)
17. [Environment Variables Cheat Sheet](#17-environment-variables)
18. [Deployment Sequence (Do This Every Time)](#18-deployment-sequence)
19. [The "Don't Do This" List](#19-dont-do-this-list)

---

## 1. Architecture Quick Reference

```
Browser → aistockassist.com (Vercel - Static React SPA)
           ├── /api/create-checkout-session (Vercel serverless → Stripe)
           ├── /api/webhook (Vercel serverless → Stripe webhook → Supabase)
           └── All other routes → index.html (SPA)
                    │
                    ▼ (API calls with JWT Bearer token)
           api.aistockassist.com (Render - FastAPI Python)
           ├── /health (no auth, root-level, bypasses rate limit)
           ├── /api/analyze (POST, JWT)
           ├── /api/recommendation (POST, JWT)
           ├── /api/comparative (POST, JWT)
           ├── /api/chart-data (POST, JWT)
           ├── /api/discover (POST, JWT)
           └── /api/export/word (POST, JWT)
                    │
                    ▼
           Supabase PostgreSQL (Auth + user_profiles + analysis_history)
```

**Key URLs:**
- Frontend: `https://aistockassist.com` (Vercel)
- Backend: `https://api.aistockassist.com` → CNAME to `ai-stock-render-api.onrender.com`
- Direct Render URL: `https://ai-stock-render-api.onrender.com` (use as fallback if custom domain SSL breaks)
- Supabase: `https://gcuvtpccyotujnuufxod.supabase.co`
- Stripe Dashboard: `https://dashboard.stripe.com`

**GitHub Repos:**
- Frontend: `github.com/lhiebert01/ai-stock-assist-web`
- Backend: `github.com/lhiebert01/ai-stock-render` (api/ directory)

---

## 2. Critical Bugs Fixed

### BUG-001: "Failed to Fetch" — Render Custom Domain SSL Breakage

**Symptom:** All API calls fail with "Failed to fetch" network error. Users see the error after clicking Analyze.

**Root Cause:** The custom domain `api.aistockassist.com` has its SSL/TLS certificate broken on Render. The CNAME DNS is correct, but Render's TLS handshake fails. The direct Render URL (`ai-stock-render-api.onrender.com`) works fine.

**Diagnosis:**
```bash
# This fails (SSL handshake failure):
curl -sv https://api.aistockassist.com/health
# TLSv1.3 (IN), TLS alert, handshake failure (552)

# This works:
curl -s https://ai-stock-render-api.onrender.com/health
# {"status":"ok"}
```

**Fix Options:**
1. **Quick fix:** Change `VITE_API_URL` in Vercel env vars to `https://ai-stock-render-api.onrender.com`, redeploy
2. **Proper fix:** Render Dashboard → ai-stock-render-api service → Settings → Custom Domains → Re-verify/Re-issue certificate for `api.aistockassist.com`
3. **Prevention:** Monitor the health endpoint regularly. Add a health check badge to admin dashboard.

**LESSON:** Custom domain SSL certs on Render can break silently (billing suspension, cert rotation, service redeployment). Always have the direct `.onrender.com` URL as a documented fallback. Consider adding a frontend fallback that tries the direct URL if the custom domain fails.

---

### BUG-002: Stale Closure in `onAuthStateChange` — Views Reset on Tab Switch

**Symptom:** User is on Learn page, clicks a Substack link (new tab), returns to the app, and the view has reset to the Analyzer page.

**Root Cause:** `supabase.auth.onAuthStateChange()` fires a `TOKEN_REFRESHED` event periodically. The callback inside `useEffect([], [])` captures the `view` variable at mount time (always `'landing'`). When the token refreshes, it checks `if (view === 'landing')` — which is always true due to the stale closure — and redirects to `'analyzer'`.

**Before (broken):**
```typescript
useEffect(() => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // ❌ `view` is always 'landing' here (stale closure)
      if (view === 'auth' || view === 'landing') setView('analyzer');
    }
  });
}, []); // Empty deps = view captured at mount time
```

**After (fixed):**
```typescript
useEffect(() => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // ✅ Functional update reads CURRENT state
      setView(curr => (curr === 'auth' || curr === 'landing') ? 'analyzer' : curr);
    } else {
      setView(curr => (curr !== 'landing' && curr !== 'privacy' && curr !== 'terms' && curr !== 'learn' && curr !== 'metrics') ? 'landing' : curr);
    }
  });
}, []);
```

**LESSON:** NEVER read React state directly inside `onAuthStateChange` or any listener in a `useEffect([], [])`. ALWAYS use functional state updates (`setX(curr => ...)`) to read the current value. When adding new views that should survive auth token refresh, add them to the safe list in BOTH the login and logout branches.

---

### BUG-003: History Tab Always Empty

**Symptom:** User analyzes 8 stocks, goes to History tab, sees "No analyses yet."

**Root Cause:** `StockAnalyzer` component never wrote analysis results to the `analysis_history` Supabase table. The AnalysisHistory component was reading from an empty table.

**Fix:** Added Supabase insert at the end of the analysis pipeline in `StockAnalyzer.tsx`:
```typescript
// After analysis completes successfully:
try {
  await supabase.from('analysis_history').insert({
    user_id: userId,
    tickers: successfulTickers,
    methodology,
    snapshots: snapshots,
    recommendation: recommendations,
    comparative_analysis: comparativeText,
  });
} catch (e) {
  console.warn('[History] Failed to save:', e);
  // Non-blocking — don't break the analysis flow
}
```

**Second Issue:** `AnalysisHistory.tsx` treated `tickers` as `string` but the DB column is `text[]` (PostgreSQL array). Fixed the component to handle arrays:
```typescript
// Fixed: handle tickers as string[]
{Array.isArray(entry.tickers) ? entry.tickers.join(', ') : entry.tickers}
```

**LESSON:** When creating a "history" feature, always verify BOTH the write path (where data is inserted) AND the read path (where it's displayed). Check the DB schema column types match the frontend types.

---

### BUG-004: Credit Deduction Failures (Multiple Sub-Bugs)

**4a. Silent RLS Failure:**
- Supabase returns HTTP 200 even when Row Level Security blocks an update
- Fix: Add `.select()` to verify the update actually happened:
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .update({ credits_remaining: newCredits })
  .eq('id', user.id)
  .select('credits_remaining')  // ← Forces response, catches RLS blocks
  .single();

if (!data) {
  console.error('RLS may be blocking the update');
}
```

**4b. Deducting Per-Run Instead of Per-Stock:**
- Originally deducted 1 credit per analysis run regardless of stock count
- Fix: Deduct `successfulStocks.length` credits (1 per successful stock)

**4c. Deducting Credits for Failed Stocks:**
- Originally deducted for all requested stocks, even if some failed (e.g., "APPL" typo)
- Fix: Only count successful snapshots, not the original input list

**LESSON:** Credit systems need 3 checks: (1) pre-check before API call, (2) deduct only for successes, (3) verify DB actually updated. Always `.select()` after Supabase updates.

---

### BUG-005: Discovery → Analyze Flow Broken

**Symptom:** User selects stocks in Discovery, clicks "Analyze Selected", lands on Analyzer page with empty input.

**Root Cause:** `StockAnalyzer` initialized `input` with `useState('')`, ignoring the `initialTickers` prop.

**Fix:**
```typescript
// Before: input always starts empty
const [input, setInput] = useState('');

// After: pre-populate from Discovery
const [input, setInput] = useState(initialTickers || '');
```

Also added `key={analyzerInput}` to force a fresh mount when tickers change:
```tsx
<StockAnalyzer key={analyzerInput} initialTickers={analyzerInput} ... />
```

**LESSON:** When passing data between views in a SPA, use both a prop AND a React `key` to ensure the component re-mounts with fresh state. The `key` pattern is the cleanest way to reset a component.

---

## 3. Deployment Fixes

### DEP-001: Render Cold Start (Free Tier)

**Problem:** Render's free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds and usually times out.

**Solution:** Exponential backoff retry in `stockApi.ts`:
```typescript
async function fetchWithRetry(url, options, maxRetries = 3, baseDelay = 1500) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        // Delays: 1.5s, 3s, 6s
      }
    }
  }
  throw new Error('Failed to fetch after retries');
}
```

Also added `healthCheck()` call on app mount to warm up the backend:
```typescript
useEffect(() => {
  healthCheck(); // Fire-and-forget ping to wake Render
}, []);
```

**LESSON:** If using Render free tier, ALWAYS implement client-side retry. The health check warmup helps but doesn't guarantee the backend is ready for the first real request.

---

### DEP-002: Custom Domain SSL Certificate

**Problem:** `api.aistockassist.com` SSL cert can break after Render billing incidents, service redeployments, or cert rotation.

**Diagnosis:**
```bash
curl -sv https://api.aistockassist.com/health 2>&1 | grep -i "alert\|error"
# Look for: "TLS alert, handshake failure"

# Verify direct URL works:
curl -s https://ai-stock-render-api.onrender.com/health
# Should return: {"status":"ok"}
```

**Fix:** Render Dashboard → Service → Settings → Custom Domains → Delete and re-add `api.aistockassist.com`

**Quick Workaround:** Change `VITE_API_URL` in Vercel to `https://ai-stock-render-api.onrender.com`, redeploy.

---

### DEP-003: Vercel Environment Variable Changes Require Redeploy

**Problem:** Changed a Vercel env var but the app still uses the old value.

**Fix:** Vercel env vars are injected at BUILD TIME (because `VITE_*` vars are compiled into the JavaScript bundle). You MUST trigger a new deployment after changing env vars.

```bash
# Option 1: Push a commit (auto-deploys)
git commit --allow-empty -m "Trigger redeploy"
git push

# Option 2: Vercel dashboard → Deployments → Redeploy
```

**LESSON:** `VITE_*` env vars are compile-time, not runtime. Changing them in the dashboard does nothing until you redeploy.

---

### DEP-004: Supabase Auth Redirect URL Configuration

**Problem:** Google OAuth or email confirmation redirects to the wrong URL, or the URL contains `#access_token=...` fragments that persist.

**Fix:** In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://aistockassist.com`
- **Redirect URLs:** `https://aistockassist.com/**`

The `#access_token=...` hash in the URL is normal for Supabase auth callbacks. The Supabase JS client reads it automatically. If it persists visually, add cleanup:
```typescript
// Clean up auth hash fragments from URL
if (window.location.hash.includes('access_token')) {
  window.history.replaceState({}, '', window.location.pathname);
}
```

---

## 4. CSS / UI / UX Fixes

### CSS-001: Background Image Transparency — Constrained to Container Width

**Symptom:** Background image only covers the inner content area (e.g., `max-w-4xl`), not the full viewport.

**Root Cause:** The background `<div>` used `absolute inset-0` inside a `max-w-4xl` parent, so it was constrained to 4xl width.

**Fix:** Use `fixed inset-0` with `-z-10` and `pointer-events-none`:
```tsx
<div className="fixed inset-0 -z-10 pointer-events-none">
  <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
       style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
  <div className="absolute inset-0 bg-gradient-to-b
    from-[var(--color-surface-0)]/80 via-transparent to-[var(--color-surface-0)]" />
</div>
```

**Key details:**
- `fixed` = relative to viewport (fills entire screen)
- `-z-10` = behind all content
- `pointer-events-none` = clicks pass through
- `opacity-[0.06]` to `opacity-[0.08]` = subtle texture
- Gradient overlay blends into page background at top and bottom

**Applied to:** Payments, Learn, History, Discovery, MetricsGuide, PrivacyPolicy, TermsOfService pages.

**LESSON:** For full-viewport background effects, always use `fixed inset-0`, never `absolute inset-0` (which is constrained by the nearest positioned parent).

---

### CSS-002: Footer "Home" Link Causes SSL Error

**Symptom:** Clicking "Home" in footer shows `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`.

**Root Cause:** Footer used `<a href="/">` which triggers a full page reload. On some configurations, this causes SSL issues or breaks the SPA.

**Fix:** Use SPA navigation callback instead of `<a href>`:
```tsx
// Before (broken):
<a href="/" className="...">Home</a>

// After (fixed):
<button onClick={() => onNavigate('landing')} className="...">Home</button>
```

**LESSON:** In an SPA without React Router, NEVER use `<a href="/">` for internal navigation. Always use onClick handlers that call the view-changing function. Reserve `<a href>` for external links only.

---

### CSS-003: Consistent Page Layout Pattern

Every page follows this structure:
```tsx
<div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
  {/* Background (fixed, full viewport) */}
  <div className="fixed inset-0 -z-10 pointer-events-none">
    <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
         style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
    <div className="absolute inset-0 bg-gradient-to-b
      from-[var(--color-surface-0)]/80 via-transparent to-[var(--color-surface-0)]" />
  </div>

  {/* Page header */}
  <div className="text-center mb-8">
    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Page Title</h1>
    <p className="text-[var(--color-text-secondary)] text-sm">Subtitle</p>
  </div>

  {/* Content */}
  ...
</div>
```

---

## 5. Feature Implementation Lessons

### FEAT-001: Adding a New View/Page (Full Checklist)

Every time you add a new page to this SPA, you must update **5 files**:

| Step | File | Change |
|------|------|--------|
| 1 | `src/App.tsx` | Add to `View` type union, import component, add render block |
| 2 | `src/components/Navbar.tsx` | Add to `View` type union, add to navItems if needed |
| 3 | `src/components/Footer.tsx` | Add to `View` type union, add navigation link |
| 4 | `src/App.tsx` (onAuthStateChange) | Add to stale-closure safe view list if the page should survive token refresh |
| 5 | The component file itself | Create with standard layout pattern |

**The View type must be identical in ALL files:**
```typescript
type View = 'landing' | 'analyzer' | 'discovery' | 'history' | 'payments'
  | 'admin' | 'auth' | 'learn' | 'metrics' | 'privacy' | 'terms';
```

**LESSON:** The #1 "why isn't my page showing" mistake is forgetting one of these 5 steps, especially the stale closure safe list.

---

### FEAT-002: Premium/Gated Features

**Pattern:** Show feature only to users who have purchased credits.

```tsx
// In the parent component:
const hasPaidAccess = (userProfile?.credits_remaining ?? 0) > 0;

// Conditionally render:
{hasPaidAccess && (
  <button onClick={onNavigateMetrics}>
    Complete Metrics Guide
    <span className="px-2 py-0.5 bg-[var(--color-accent)]/15 rounded text-[10px] font-bold">
      Pro
    </span>
  </button>
)}
```

**LESSON:** Pass `userProfile` down to any component that needs to gate features. The simplest check is `credits_remaining > 0`.

---

### FEAT-003: External Links Must Not Break SPA State

**Problem:** Clicking a Substack link (external) opens a new tab. When user returns, the auth token refresh fires and the stale closure bug resets their view.

**Solution:** The stale closure fix (BUG-002) handles this. But also:
- External links: `target="_blank" rel="noopener noreferrer"` (always)
- Internal navigation: `onClick` handlers (never `<a href>`)

---

### FEAT-004: Content Duplication Between Logged-In and Logged-Out

**Problem:** Educational content was only on `MarketingLanding` (visible when NOT logged in). Logged-in users couldn't access it.

**Solution:** Created a dedicated `LearnPage` component with the same content, accessible via the "Learn" nav tab. Both share the same data arrays (blog episodes, metrics, ecosystem) but render independently.

**LESSON:** Always consider both logged-in and logged-out user flows. Marketing pages are for conversion; in-app pages are for retention. Educational content should be in both.

---

## 6. React State Management Gotchas

### STATE-001: Functional State Updates in Event Listeners

ALWAYS use functional updates inside callbacks that run in `useEffect([], [])`:

```typescript
// ❌ BROKEN — stale closure
setView('analyzer');

// ✅ CORRECT — reads current state
setView(curr => (curr === 'auth' || curr === 'landing') ? 'analyzer' : curr);
```

### STATE-002: Component Re-mount with `key` Prop

When passing data between views, use `key` to force a clean remount:
```tsx
<StockAnalyzer key={analyzerInput} initialTickers={analyzerInput} />
```

Without `key`, the component keeps its old state even when props change.

### STATE-003: Profile Loading Race Condition

**Problem:** `loadProfile()` fails with "JWT not ready" if called immediately after `onAuthStateChange` fires.

**Fix:** Delay profile load + execute outside the auth callback:
```typescript
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    // Use setTimeout to break out of the auth callback
    setTimeout(() => loadProfile(appUser), 100);
  }
});

async function loadProfile(appUser) {
  // Wait for JWT to settle
  await new Promise(resolve => setTimeout(resolve, 500));
  // Now query
  const { data } = await supabase.from('user_profiles').select('*').eq('id', appUser.id).single();
}
```

---

## 7. Supabase Auth & Database Patterns

### SUP-001: Profile Auto-Creation on First Login

```typescript
const { data: profile, error } = await supabase
  .from('user_profiles').select('*').eq('id', appUser.id).single();

if (error && error.code === 'PGRST116') {
  // No profile exists — create one
  await supabase.from('user_profiles').insert({
    id: appUser.id,
    email: appUser.email,
    username: appUser.email.split('@')[0],
    is_admin: appUser.email.toLowerCase() === 'lindsay.hiebert@gmail.com',
  });
}
```

### SUP-002: Admin Check

```typescript
const isAdmin = userProfile?.is_admin === true;
```

Set via SQL: `UPDATE user_profiles SET is_admin = true WHERE email = 'lindsay.hiebert@gmail.com';`

### SUP-003: RLS Policy Gotchas

- Users can only read/update their OWN profile
- Service role key (used in Stripe webhook) bypasses RLS
- Always `.select()` after updates to verify RLS didn't block the write

### SUP-004: Database Column Types

| Column | Type | Notes |
|--------|------|-------|
| `user_profiles.id` | UUID | References `auth.users(id)` |
| `user_profiles.credits_remaining` | INTEGER | Default 3 (free trial) |
| `analysis_history.tickers` | TEXT[] | PostgreSQL array, NOT string |
| `analysis_history.snapshots` | JSONB | Full snapshot objects |
| `analysis_history.recommendation` | JSONB | AI recommendations |

---

## 8. Render Backend Patterns

### RENDER-001: Health Check Endpoint

The health check MUST be at root level (`/health`), NOT under `/api/health`, to bypass rate limiting:
```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

### RENDER-002: CORS Configuration

Must include both custom domain AND direct Render URL in allowed origins:
```python
origins = [
    "https://aistockassist.com",
    "https://www.aistockassist.com",
    "https://ai-stock-assist-web.vercel.app",  # Vercel preview
    "http://localhost:5173",                     # Local dev
]
```

### RENDER-003: Cold Start Warmup

Call `healthCheck()` from the frontend on mount to start waking the backend before the user clicks anything.

### RENDER-004: When Custom Domain SSL Breaks

1. Test direct URL: `curl https://ai-stock-render-api.onrender.com/health`
2. If direct works but custom domain doesn't → SSL cert issue
3. Fix in Render Dashboard → Custom Domains → Delete and re-add
4. Temporary workaround: change `VITE_API_URL` to direct URL

---

## 9. Stripe Payment Integration

### STRIPE-001: One-Time Payments (Not Subscriptions)

```typescript
// Vercel serverless: api/create-checkout-session.ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',  // NOT 'subscription'
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/payments`,
  metadata: { userId, planId },
});
```

### STRIPE-002: Webhook Credit Addition

```typescript
// Vercel serverless: api/webhook.ts
// Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
const { userId, planId } = session.metadata;
await supabase.from('user_profiles').update({
  credits_remaining: profile.credits_remaining + creditsToAdd,
  total_purchases: profile.total_purchases + 1,
}).eq('id', userId);
```

### STRIPE-003: Payment Success Detection

After Stripe redirects back, the URL contains `?session_id=...`:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('session_id')) {
    window.history.replaceState({}, '', '/');
    setPaymentMessage('Payment successful!');
    setTimeout(() => refreshProfile(), 3000); // Wait for webhook
  }
}, [user]);
```

---

## 10. SPA Navigation Patterns

### NAV-001: View-Based Routing (No React Router)

This app uses a simple `View` union type instead of React Router:
```typescript
type View = 'landing' | 'analyzer' | 'discovery' | ... ;

const navigateTo = (newView: View) => {
  setView(newView);
  window.scrollTo(0, 0);
};
```

**Trade-offs:**
- Simpler than React Router (no route definitions, no URL sync)
- But: no browser back/forward, no deep linking, no URL sharing
- State must be carefully managed (stale closures, functional updates)

### NAV-002: Passing Data Between Views

Use a shared state variable in App.tsx + a handler function:
```typescript
// In App.tsx:
const [analyzerInput, setAnalyzerInput] = useState('');

const handleDiscoveryAnalyze = (tickers: string) => {
  setAnalyzerInput(tickers);
  setView('analyzer');
};

// In JSX:
<StockDiscovery onAnalyze={handleDiscoveryAnalyze} />
<StockAnalyzer key={analyzerInput} initialTickers={analyzerInput} />
```

---

## 11. Component Checklist

### When creating a NEW component/page:

- [ ] Create `src/components/NewPage.tsx` with standard layout pattern
- [ ] Add `'newpage'` to View type in `App.tsx`
- [ ] Add `'newpage'` to View type in `Navbar.tsx`
- [ ] Add `'newpage'` to View type in `Footer.tsx`
- [ ] Import and render in App.tsx: `{view === 'newpage' && <NewPage />}`
- [ ] Add to stale closure safe list if it should survive auth refresh
- [ ] Add navigation link in Navbar (if in main nav) or Footer (if in learn/legal section)
- [ ] Add background transparency div if the page has content
- [ ] `npx vite build` to verify no TypeScript errors
- [ ] Test: navigate to the page, verify it renders, verify other pages still work

### When modifying an EXISTING component:

- [ ] Read the file first (understand existing patterns)
- [ ] Check prop interfaces — any new props need parent updates
- [ ] Check if the component uses `key` prop for re-mounting
- [ ] `npx vite build` to verify
- [ ] Test the specific feature AND adjacent features (e.g., navigation)

---

## 12. Theme & Styling Patterns

### Color System (CSS Custom Properties)

```css
--color-surface-0: #0a0e1a;       /* Deepest background */
--color-surface-1: #0f1629;       /* Navbar, cards */
--color-surface-2: #151d35;       /* Card interiors */
--color-surface-3: #1b2541;       /* Hover states */
--color-border: #1e293b;          /* Default borders */
--color-border-light: #334155;    /* Lighter borders */
--color-text-primary: #f1f5f9;    /* Main text */
--color-text-secondary: #94a3b8;  /* Secondary text */
--color-text-muted: #64748b;      /* Muted text */
--color-accent: #22d3ee;          /* Cyan — primary action */
--color-accent-dim: #0891b2;
--color-buy: #22c55e;             /* Green */
--color-sell: #ef4444;            /* Red */
--color-hold: #eab308;            /* Yellow */
```

### Card Pattern
```tsx
className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-6
  hover:border-[var(--color-accent)]/20 transition-all"
```

### Button Patterns
```tsx
// Primary (accent)
className="px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)]
  rounded-lg font-bold hover:brightness-110 transition-all"

// Secondary (surface)
className="px-4 py-2 bg-[var(--color-surface-3)] border border-[var(--color-border)]
  rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white transition-all"
```

### Badge Pattern (Color-Coded)
```tsx
// Green (good)
className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
// Yellow (caution)
className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
// Red (bad)
className="bg-red-500/15 text-red-400 border-red-500/20"
```

---

## 13. SEO & Meta Tags

### index.html Meta Tags
- Open Graph (og:title, og:description, og:image, og:url)
- Twitter Card (summary_large_image)
- JSON-LD schemas: SoftwareApplication, Organization, FAQ
- `article:published_time` and `article:modified_time` for LinkedIn

### Public SEO Files
- `/public/robots.txt` — Allow all crawlers
- `/public/sitemap.xml` — Homepage URL
- `/public/og-image.jpg` — 1200x630 social sharing image

---

## 14. Testing & Verification Checklist

After ANY deployment:

```
CRITICAL PATH:
□ aistockassist.com loads (not blank page)
□ api.aistockassist.com/health returns {"status":"ok"}
□ Sign up new user → gets 3 free credits
□ Analyze "AAPL" → stock card + chart + AI recommendation
□ Credits deducted correctly (1 per successful stock)
□ Failed ticker (e.g., "XXXYZ") doesn't consume credits
□ Stripe: Buy Starter → checkout → credits added
□ History tab shows past analyses
□ Discovery → select stocks → Analyze → pre-populates analyzer

SECONDARY:
□ Learn tab → blog links open Substack in new tab
□ Metrics Guide button visible (if credits > 0)
□ Footer links all work (SPA navigation, not page reloads)
□ Privacy Policy and Terms render
□ Admin dashboard loads for admin user
□ Mobile responsive (test on phone)
□ Google OAuth login works
```

---

## 15. Common User Mistakes to Anticipate

| User Action | What Happens | Prevention |
|-------------|-------------|------------|
| Types "APPL" instead of "AAPL" | Ticker error (not found) | Show error for that ticker, don't charge credit |
| Enters > 10 tickers | Only first 10 processed | `.slice(0, 10)` with UI warning |
| Tries to analyze with 0 credits | "No credits" message | Pre-check before API call |
| Clicks "Home" in footer | Should SPA-navigate | Use `onClick` not `<a href>` |
| Returns from external link | View should NOT reset | Stale closure fix (functional updates) |
| URL has `#access_token=...` | Normal Supabase auth flow | Clean up with `replaceState` |

---

## 16. File Quick Reference

| File | Purpose | Lines |
|------|---------|-------|
| `src/App.tsx` | View router, auth, credit mgmt | ~270 |
| `src/components/StockAnalyzer.tsx` | Main analysis interface | ~256 |
| `src/components/StockCard.tsx` | Individual stock display | ~203 |
| `src/components/PriceChart.tsx` | TradingView charts | ~148 |
| `src/components/MarketingLanding.tsx` | Landing page (logged out) | ~463 |
| `src/components/LearnPage.tsx` | Educational content (logged in) | ~242 |
| `src/components/MetricsGuide.tsx` | Premium metrics reference | ~439 |
| `src/components/MetricsGlossary.tsx` | Slide-out glossary panel | ~184 |
| `src/components/Navbar.tsx` | Navigation bar | ~223 |
| `src/components/Footer.tsx` | Footer with links | ~117 |
| `src/components/Auth.tsx` | Login/signup/reset + OAuth | ~250 |
| `src/components/Payments.tsx` | Credit purchase | ~157 |
| `src/components/StockDiscovery.tsx` | Stock screener | ~200 |
| `src/components/AnalysisHistory.tsx` | Past analyses | ~103 |
| `src/components/AdminDashboard.tsx` | Admin panel | ~140 |
| `src/components/PrivacyPolicy.tsx` | Legal | ~139 |
| `src/components/TermsOfService.tsx` | Legal | ~162 |
| `src/services/stockApi.ts` | API calls + retry | ~125 |
| `src/types/user.ts` | User types + credit packs | ~55 |
| `src/types/stock.ts` | Stock types + categories | ~129 |
| `src/lib/formatters.ts` | Number/currency formatting | ~54 |
| `src/lib/json-ld.ts` | SEO structured data | ~49 |
| `api/create-checkout-session.ts` | Vercel: Stripe checkout | ~45 |
| `api/webhook.ts` | Vercel: Stripe webhook | ~96 |
| `supabase/migration.sql` | DB schema + RLS | ~114 |

---

## 17. Environment Variables

### Vercel (Frontend)

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_SUPABASE_URL` | `https://gcuvtpccyotujnuufxod.supabase.co` | Build-time |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Build-time, public OK |
| `VITE_API_URL` | `https://api.aistockassist.com` | Build-time, fallback: direct Render URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Build-time, public OK |
| `VITE_STRIPE_PRICE_ID_PRO` | `price_1TG1e1G2UTIPy8Q7Qrbjx7sw` | $9.99, 50 analyses |
| `VITE_STRIPE_PRICE_ID_STARTER` | `price_1TG1j6G2UTIPy8Q7DhdWbVi2` | $4.99, 20 analyses |
| `VITE_APP_URL` | `https://aistockassist.com` | For Stripe redirect URLs |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Server-only (Vercel functions) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Server-only (Vercel functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-only (bypasses RLS) |

### Render (Backend)

| Variable | Notes |
|----------|-------|
| `GOOGLE_API_KEY` | Gemini API key |
| `GROQ_API_KEY` | Groq API key (fallback) |
| `SUPABASE_JWT_SECRET` | From Supabase → Settings → API |

**CRITICAL:** `VITE_*` vars are compiled into the JS bundle at build time. Changing them requires a new deployment.

---

## 18. Deployment Sequence

### For code changes:

```bash
# 1. Build locally to catch errors BEFORE pushing
npx vite build

# 2. Commit
git add <specific-files>
git commit -m "Description of changes"

# 3. Push (auto-deploys on Vercel)
git push origin main

# 4. Verify deployment
# - Check Vercel dashboard for build status
# - Visit aistockassist.com, hard refresh (Ctrl+Shift+R)
# - Run through critical path checklist (Section 14)
```

### For infrastructure changes:

1. **DNS changes:** Update in domain registrar, wait for propagation (5-60 min)
2. **Supabase schema changes:** Run SQL in Supabase SQL Editor
3. **Render backend changes:** Push to ai-stock-render repo (auto-deploys)
4. **Render custom domain SSL:** Dashboard → Custom Domains → re-verify
5. **Stripe webhook changes:** Stripe Dashboard → Developers → Webhooks

---

## 19. The "Don't Do This" List

| Don't | Why | Do Instead |
|-------|-----|------------|
| Use `<a href="/">` for internal nav | Causes full reload + possible SSL error | `<button onClick={() => onNavigate('view')}>` |
| Read state directly in useEffect callbacks | Stale closure captures value at mount time | Use functional updates: `setState(curr => ...)` |
| Forget to add view to safe list | Auth token refresh will redirect the user | Add to both login AND logout branches |
| Use `absolute inset-0` for full-page backgrounds | Constrained by parent container width | Use `fixed inset-0 -z-10 pointer-events-none` |
| Deploy without `npx vite build` | TypeScript errors break production | Always build locally first |
| Assume Supabase updates succeed | RLS can silently block writes | Always `.select()` after updates |
| Use `aistockassist.substack.com` | That URL doesn't exist | Use `lindsayhiebert.substack.com` |
| Deduct credits for failed stocks | Users shouldn't pay for API failures | Count only successful snapshots |
| Create component without wiring 5 files | Page won't render or will break navigation | Follow FEAT-001 checklist |
| Trust Render custom domain SSL | Certs can break silently | Always have direct `.onrender.com` fallback |
| Change env vars without redeploying | `VITE_*` compiled at build time | Must redeploy Vercel after any change |
| Use `npx tsc` for type checking | Vite env types cause false positives | Use `npx vite build` instead |

---

## Appendix: Git Commit History (Full Sprint)

```
bc174bc  Add premium Metrics Guide page with 25+ metrics, gated for paid users
1478550  Fix Discovery → Analyze flow: pre-populate tickers and show 10-stock limit
0eb913d  Fix stale closure bug: Learn page (and all views) no longer reset on tab switch
8a89d69  Fix Substack URLs, episode details, and footer navigation
5e1251a  Add educational content, Learn tab, Privacy/Terms, Metrics Glossary, and fixes
e2788fd  Change analysis time claim from 5 seconds to 30 seconds
d89f1da  Update OG and hero images: laptop + phone with AI Stock Assist app
2edc7bf  Add hero showcase image to landing page
ef8554c  Logo click navigates to landing page for all users
fdb0b7b  Add OG image for social sharing, hero and payments backgrounds
384f6cd  Only deduct credits for successfully analyzed stocks
42f7591  Deduct one credit per stock analyzed, not per analysis run
d9ab0db  Improve credit deduction with .select() to detect silent RLS failures
7cfc15c  Add visible Buy Credits button in navbar header
0762ffa  Fix credit deduction and add payment success message
29cd122  Show user initials and name in navbar, improve profile dropdown
2e3886a  Add credit deduction after successful stock analysis
d8802be  Fix deadlock: load profile outside onAuthStateChange callback
abd3ded  Add delay before profile query to let auth token settle
584cad4  Fix auth race condition causing profile load failure
c01f32b  Log profile error as JSON for debugging
e539c4b  Add debug logging to profile loader
1f33150  Handle Supabase email confirmation in signup flow
ba5090a  Fix Supabase migration: drop existing VARCHAR table before creating UUID version
c09f865  Add deployment guide, implementation summary, and Supabase migration
a884a80  Initial scaffold: React 19 + TypeScript + Vite + FastAPI backend
```

---

## 20. Executive Summary — Full Migration Retrospective

### What We Did
Ported AI Stock Assist from a **Streamlit Python app** (custom auth, bcrypt passwords, VARCHAR IDs) to a **React 19 Single Page Application** (Supabase Auth, UUID IDs, Stripe, Vercel + Render) in a ~24-hour sprint, then spent a follow-up session building admin tools and migrating users to production.

**SPA (Single Page Application):** Instead of loading a new HTML page for each screen (like the old Streamlit app), the browser loads one page and JavaScript swaps the content dynamically. That's why we use `setView('analyzer')` instead of navigating to `/analyzer`.

### What Worked Well
- **Architecture split** — Vercel (frontend + serverless functions) + Render (FastAPI backend) + Supabase (auth + DB) is clean and scalable
- **Serverless pattern** — `api/webhook.ts` and `api/admin/users.ts` using service role key for privileged operations keeps secrets server-side
- **Retry patterns** — Exponential backoff for Render cold starts prevents user-facing errors
- **Incremental deployment** — pushing small commits and testing each feature individually caught issues early
- **Lessons doc** — having CLAUDE-LESSONS-LEARNED.md meant we didn't repeat mistakes

### What Could Have Been Better
- **Direct SQL into auth.users was a mistake** — caused "Database error querying schema" for all 4 migrated users. Supabase's GoTrue service has internal fields we didn't populate. Should have used `auth.admin.createUser()` from the start
- **Supabase project confusion** — wasted time editing email templates on the wrong project. With multiple Supabase projects, always verify the project URL first
- **Email rate limits** — didn't anticipate Supabase's built-in email service throttling during testing (~3-4/hour). Multiple rapid test resets caused unnecessary debugging
- **View type duplication** — the `View` type must be identical across App.tsx, Navbar.tsx, and Footer.tsx with no single source of truth. This is fragile
- **No React Router** — simpler but costs us deep linking, back/forward, and URL sharing

### Key Lessons Learned
1. **Never insert directly into `auth.users`** — always use `supabase.auth.admin.createUser()` via a serverless function
2. **Supabase email templates are per-project** — if you share a project across apps, templates affect all of them
3. **`VITE_*` env vars are build-time** — changing them requires a full redeploy
4. **Stale closures kill SPAs** — always use functional state updates (`setX(curr => ...)`) inside `useEffect` callbacks
5. **`.select()` after every Supabase update** — RLS can silently block writes and return 200
6. **Render SSL certs break silently** — always keep the direct `.onrender.com` URL as a fallback
7. **iOS Keychain autofill is per-device** — "wrong password showing up" is not an app bug

### How to Do This Better Next Time
1. **Build the admin CRUD first** — having Create User via the proper API from day one avoids SQL migration hacks
2. **Set up custom SMTP early** — avoids rate limit frustration during testing
3. **Extract View type to a shared file** — `types/views.ts` imported by App, Navbar, Footer
4. **Add React Router** if the app will grow beyond ~5 views — the manual view system doesn't scale
5. **Test password reset flow before migrating users** — we deployed the SetNewPassword screen and migration in the same session, which created debugging confusion
6. **Document the Supabase project name/URL mapping** early — prevents editing the wrong project

---

## 21. Admin & Migration Session (2026-03-29)

### Changes Made
| File | Change |
|------|--------|
| `api/admin/users.ts` | **NEW** — Vercel serverless CRUD (POST/PUT/DELETE/GET) with admin JWT verification |
| `src/components/AdminDashboard.tsx` | Tabs (Current/Legacy Users), create/edit/delete modals, legacy import |
| `src/components/SetNewPassword.tsx` | **NEW** — Password reset screen (replaces auto-login on recovery) |
| `src/App.tsx` | Handle PASSWORD_RECOVERY event, render SetNewPassword view |
| `src/components/Auth.tsx` | Use VITE_APP_URL for reset redirect |
| `src/components/Navbar.tsx` | View type updated with `reset-password` |
| `src/components/Footer.tsx` | View type updated with `reset-password` |

### User Migration
- 4 users migrated from old Streamlit `users` table: epsilonv, lgroshans, Carey, agmast
- **First attempt (SQL insert) failed** — direct inserts into `auth.users` missing GoTrue internal fields
- **Fix:** Cleaned up via SQL DELETE, re-created via Admin Dashboard's Create User (uses `auth.admin.createUser()`)
- Temp password: `Welcome@123`, users can reset via Forgot Password

### Supabase Email Templates
- Branded teal-blue templates created for: Reset Password, Confirm Sign Up, Invite User
- Only Reset Password applied so far (correct project: `gcuvtpccyotujnuufxod`)
- Built-in email rate limit: ~3-4/hour, 60s cooldown between same-type requests
- Template files saved in Downloads for future use

### Git Commits (This Session)
```
a78c5be  Add password reset flow with Set New Password screen
4ff086d  Add admin user management CRUD and legacy user migration
```

---

*Last updated: 2026-03-29 by Claude Code (Opus 4.6)*
*This document should be read by Claude before making any changes to this codebase.*
