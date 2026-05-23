# AI Stock Assist

> AI-powered stock analysis in seconds. The disciplined frameworks of Buffett, Graham, Munger, Lynch, Bogle, and Housel — applied to real-time market data, in plain English.

**Live product:** [aistockassist.com](https://aistockassist.com)

---

## 🏗️ Architecture (production)

```
Browser
  │
  ▼
aistockassist.com  ◄── Vercel (Static React SPA — this repo)
  │
  │  fetch
  ▼
api.aistockassist.com  ◄── DNS CNAME
  │
  ▼
ai-stock-render-api.onrender.com  ◄── Render (FastAPI — ../ai-stock-render repo)
  │
  ├─► yfinance         (market data)
  ├─► Google Gemini    (AI recommendations, with Groq Llama fallback)
  └─► Supabase         (auth + analysis history + user profiles)
                              │
                              ▼
                         Postgres (Supabase managed)

Payments: Stripe → Vercel serverless webhook → Supabase
```

### Repo layout

| Repo | Hosts | Purpose |
|---|---|---|
| **`ai-stock-assist-web`** (this repo) | Vercel | React 19 + TypeScript + Vite 6 + Tailwind v4 SPA |
| **`ai-stock-render`** (sibling) | Render service `ai-stock-render-api` | FastAPI backend serving `/api/analyze`, `/api/recommendation`, etc. |

**⚠️ Service name vs DNS:** Note that `render.yaml` in the sibling repo defines a service named `ai-stock-assist-api`, but the *live* Render service serving `api.aistockassist.com` is named **`ai-stock-render-api`**. They are different services from the same codebase. See [`docs/PROJECT-CLEANUP-PLAN-JUNE-2026.md`](./docs/PROJECT-CLEANUP-PLAN-JUNE-2026.md) for the consolidation plan.

---

## 🕰️ Architecture history

| Generation | Stack | Status |
|---|---|---|
| **Gen 1 (early 2025)** | Streamlit single-file app | ❌ Superseded |
| **Gen 2 (mid 2025–Q1 2026)** | Streamlit + Supabase auth + Stripe + AI services. Polished MVP. | ❌ Superseded by Gen 3, slated for deletion in June 2026 cleanup |
| **Gen 3 (Q1 2026 →)** | React SPA on Vercel + FastAPI on Render + Supabase. Current production. | ✅ **Live** |

The legacy Streamlit service still runs at `ai-stock-assist.onrender.com` only because nobody's flipped the off switch yet. It has no role in the live product. See cleanup plan above.

---

## 🚀 Development

### Prerequisites
- Node 20+ (frontend)
- Python 3.11+ (backend — sibling repo)
- Supabase project, Stripe account, Google Gemini + Groq API keys

### Frontend (this repo)

```bash
# Install
npm install

# Run dev server (Vite on :5173)
npm run dev

# Type check + build
npm run build

# Preview production build
npm run preview
```

Environment variables for the frontend live in `.env.local`. Canonical record is `.env.example`. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full list.

### Backend (sibling repo `ai-stock-render`)

```bash
cd ../ai-stock-render/api
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Set the frontend's `VITE_API_URL=http://localhost:8000` in `.env.local` to point at the local backend.

---

## 🚢 Deployment

Both apps **auto-deploy on push to `main`**:

| Push to | Deploys to | Time |
|---|---|---|
| `ai-stock-assist-web` main | Vercel production | ~90s |
| `ai-stock-render` main | `ai-stock-render-api` on Render | ~2–5 min |

⚠️ **Testing usually happens in production** (no `.env.local` configured for most contributors). Always add Vercel / Render env vars *before* pushing code that depends on them.

For full deployment runbook: [`DEPLOYMENT.md`](./DEPLOYMENT.md).
For deployment sequencing & lessons: [`CLAUDE-LESSONS-LEARNED.md`](./CLAUDE-LESSONS-LEARNED.md).

---

## 📚 Documentation

| File | Purpose |
|---|---|
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Step-by-step deployment runbook, env var checklist |
| [`CLAUDE-LESSONS-LEARNED.md`](./CLAUDE-LESSONS-LEARNED.md) | Bug catalog, gotchas, "don't do this" list — read before touching anything load-bearing |
| [`docs/RELEASE-NOTES-MAY-2026.md`](./docs/RELEASE-NOTES-MAY-2026.md) | Latest release notes |
| [`docs/PROJECT-CLEANUP-PLAN-JUNE-2026.md`](./docs/PROJECT-CLEANUP-PLAN-JUNE-2026.md) | Streamlit + orphan-service decommission plan |
| [`docs/PUBLISHED-CONTENT-TRACKER.md`](./docs/PUBLISHED-CONTENT-TRACKER.md) | Marketing campaign log (Substack, LinkedIn, X, FB URLs) |
| [`docs/PUBLISHING-PLAN-MAY-2026-LIBRARY-AND-EP5.md`](./docs/PUBLISHING-PLAN-MAY-2026-LIBRARY-AND-EP5.md) | Active publishing roadmap |
| [`docs/CLAUDE-AGENT-BRIEFING-TEMPLATE.md`](./docs/CLAUDE-AGENT-BRIEFING-TEMPLATE.md) | Template for handing off blog-episode prep to a fresh Claude session |

---

## 🤝 Built with

- **React 19** + TypeScript + **Vite 6**
- **Tailwind v4** + custom CSS variables (`src/index.css`)
- **Supabase** (auth, postgres, real-time)
- **Stripe** (credit-pack payments)
- **FastAPI** + **yfinance** + **Google Gemini** + **Groq Llama** (backend)
- **Vercel** (frontend hosting) + **Render** (backend hosting)

---

## 📜 License

© 2026 AI Stock Assist · Lindsay Hiebert · Part of the [AI for Good](https://aistockassist.com) initiative under PI GenAI.

**Disclaimer:** AI Stock Assist provides AI-generated analysis for educational purposes only. This is not financial advice. Always do your own research before making investment decisions. Past performance does not guarantee future results.
