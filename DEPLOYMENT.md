# AI Stock Assist — Deployment Guide

Complete deployment steps for the React frontend + FastAPI backend.

## Architecture

```
Browser → aistockassist.com (Vercel)
           ├── Static React SPA (dist/)
           ├── /api/create-checkout-session (Vercel serverless)
           └── /api/webhook (Vercel serverless → Supabase)
                    │
                    ▼
           api.aistockassist.com (Render)
           └── FastAPI (stock analysis, AI recommendations)
                    │
                    ▼
           Supabase PostgreSQL (auth + user_profiles + analysis_history)
```

---

## Step 1: Supabase Tables

1. Go to **Supabase Dashboard** → your project → **SQL Editor**
2. Open `supabase/migration.sql` from this repo
3. Paste the entire contents and click **Run**
4. Verify: Go to **Table Editor** → confirm `user_profiles` and `analysis_history` tables exist
5. After your first signup, set yourself as admin:
   ```sql
   update public.user_profiles set is_admin = true where email = 'lindsay.hiebert@gmail.com';
   ```

### Supabase Auth Settings

In **Authentication → Providers**:
- **Email**: Enabled (confirm email = optional for now)
- **Google OAuth**: Enable with your Google Cloud credentials
  - Authorized redirect: `https://aistockassist.com`
  - Add `https://<project-ref>.supabase.co/auth/v1/callback` as redirect URI in Google Console

In **Authentication → URL Configuration**:
- Site URL: `https://aistockassist.com`
- Redirect URLs: `https://aistockassist.com/**`

---

## Step 2: Deploy FastAPI Backend to Render

### Option A: Via Render Dashboard (Recommended)

1. Go to **Render Dashboard** → **New** → **Web Service**
2. Connect your `ai-stock-render` GitHub repo
3. Configure:
   - **Name:** `ai-stock-assist-api`
   - **Root Directory:** `api`
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Starter ($7/mo) or Free
   - **Health Check Path:** `/health`

4. Set **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `GOOGLE_API_KEY` | Your Gemini API key |
   | `GROQ_API_KEY` | Your Groq API key (fallback AI) |
   | `SUPABASE_JWT_SECRET` | From Supabase → Settings → API → JWT Secret |

5. Click **Deploy**
6. After deploy, test: `curl https://ai-stock-assist-api.onrender.com/health`

### Option B: Via render.yaml Blueprint

The `render.yaml` already has the second service configured. Use **Render Blueprints** to deploy both services from one file.

### Custom Domain

1. In Render → your API service → **Settings** → **Custom Domains**
2. Add `api.aistockassist.com`
3. Render will give you a CNAME target (e.g., `ai-stock-assist-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to **vercel.com** → **New Project**
2. Import `ai-stock-assist-web` from GitHub
3. Framework: **Vite** (auto-detected)
4. Build Command: `vite build` (auto-detected)
5. Output Directory: `dist` (auto-detected)

### Environment Variables (set in Vercel Dashboard)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://<project>.supabase.co` | From Supabase Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | From Supabase Settings → API |
| `VITE_API_URL` | `https://api.aistockassist.com` | Your Render FastAPI URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | From Stripe Dashboard |
| `VITE_STRIPE_PRICE_ID_PRO` | `price_1TG1e1G2UTIPy8Q7Qrbjx7sw` | Pro Pack $9.99 |
| `VITE_STRIPE_PRICE_ID_STARTER` | `price_1TG1j6G2UTIPy8Q7DhdWbVi2` | Starter Pack $4.99 |
| `VITE_APP_URL` | `https://aistockassist.com` | Your domain |
| `STRIPE_SECRET_KEY` | `sk_live_...` | For serverless functions only |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook setup |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | From Supabase → Settings → API (service_role) |

6. Click **Deploy**
7. Test the preview URL works

---

## Step 4: DNS Configuration

### aistockassist.com → Vercel (Frontend)

In your domain registrar (Namecheap, Cloudflare, etc.):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `76.76.21.21` | 300 |
| CNAME | `www` | `cname.vercel-dns.com` | 300 |

Then in Vercel → Project → **Settings** → **Domains**:
- Add `aistockassist.com`
- Add `www.aistockassist.com` (redirect to apex)

### api.aistockassist.com → Render (Backend API)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `api` | `ai-stock-assist-api.onrender.com` | 300 |

Then in Render → API service → **Settings** → **Custom Domains**:
- Add `api.aistockassist.com`

---

## Step 5: Stripe Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://aistockassist.com/api/webhook`
4. Events to listen for: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`)
7. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel env vars
8. **Redeploy** the Vercel project to pick up the new env var

### Test the Webhook

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Listen locally for testing
stripe listen --forward-to localhost:3000/api/webhook

# Trigger a test event
stripe trigger checkout.session.completed
```

---

## Post-Deployment Checklist

- [ ] `https://aistockassist.com` loads React app
- [ ] `https://api.aistockassist.com/health` returns `{"status": "ok"}`
- [ ] Supabase Auth: signup, login, logout all work
- [ ] Google OAuth works
- [ ] Analyze "AAPL" → stock card renders with chart and AI recommendation
- [ ] Credits deducted after analysis
- [ ] Stripe: Buy Starter Pack → checkout → credits added
- [ ] Stripe: Buy Pro Pack → checkout → credits added
- [ ] Admin dashboard loads for admin user
- [ ] Stock Discovery categories load
- [ ] Analysis History shows past analyses
- [ ] Mobile responsive on iPhone Safari

---

## Rollback Plan

The old Streamlit app at `ai-stock-assist.onrender.com` remains running. If issues arise:
1. Point `aistockassist.com` DNS back to Render (the Streamlit service)
2. The new React app stays on its Vercel preview URL for further testing
