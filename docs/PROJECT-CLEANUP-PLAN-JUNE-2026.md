# Project Cleanup Plan — June 2026

**Drafted:** May 22, 2026 (deferred from same-day cleanup to avoid risking the live production app)
**Target window:** June 2026
**Primary goal:** Reduce Render compute spend by ~$10–20/month AND eliminate the "wrong service" footgun that caused today's Gemini key + code-deploy confusion.

---

## ⛔ PRODUCTION INVARIANT — DO NOT VIOLATE

**The live production stack is:**
```
Browser  →  aistockassist.com  →  Vercel (React SPA)
                                    │
                                    ↓  (calls)
                              api.aistockassist.com
                                    │  (DNS CNAME)
                                    ↓
                       ai-stock-render-api.onrender.com
                                    │  (Render service)
                                    ↓
                         FastAPI (api/server.py from this repo's
                            ai-stock-render sibling repo)
```

**The only changes that may proceed during this cleanup are ones that preserve this exact path.** Before any decommission action: verify `api.aistockassist.com` still resolves to `ai-stock-render-api.onrender.com` and `/health` still returns 200.

Verification one-liner:
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://api.aistockassist.com/health
# Expected: HTTP 200
```

If that ever returns anything other than 200 during cleanup — **stop immediately** and roll back.

---

## What we're cleaning up and why

Today's May 22 incident exposed two confusing service mismatches that wasted ~45 minutes of debugging:

1. **`render.yaml`** in the `ai-stock-render` repo defines a service named **`ai-stock-assist-api`** — but the live DNS for `api.aistockassist.com` actually points at **`ai-stock-render-api`**, a different Render service.
2. The legacy **`ai-stock-assist`** Streamlit service was the 1st- and 2nd-gen MVP prototype (polished over 6 months from late 2025 through early 2026). It is **fully superseded** by the current production stack (Vercel + Render-FastAPI + Supabase). It still runs and consumes compute even though it has no role in the live product.

Both costs add up: ~$10/month per starter-plan service that isn't serving traffic.

---

## Render services audit (as of May 22, 2026)

| Service | Status | Purpose | Disposition |
|---|---|---|---|
| **`ai-stock-render-api`** | 🟢 **LIVE — KEEP** | FastAPI serving `api.aistockassist.com`, all React frontend analysis traffic | **MUST STAY** — invariant above depends on this |
| **`ai-stock-assist-api`** | 🔴 ORPHAN | FastAPI defined in `render.yaml` but no DNS points to it. Two FastAPI services running same code, env vars drifting | **Archive / delete after verification** |
| **`ai-stock-assist`** | 🟡 LEGACY MVP STREAMLIT | 1st/2nd-gen MVP prototype, fully superseded by Vercel + Render + Supabase production stack. Default URL `ai-stock-assist.onrender.com` still up (HTTP 200) only by inertia. Some users may still arrive via old subscriber emails or bookmarks | **Convert to redirect shell first, then delete** |

---

## June 2026 — Sequenced cleanup tasks

### Phase 0 — Pre-cleanup verification (15 min, READ-ONLY)

Do these FIRST. None of these change state.

- [ ] **Verify live API path:** run `curl -sI https://api.aistockassist.com/health` → expect `HTTP/2 200`.
- [ ] **Verify React app:** run an analysis on aistockassist.com for `AAPL` → expect successful render in <10s.
- [ ] **Audit Render Dashboard → all 3 AI-Stock services:** screenshot or note for each service:
  - Custom domains bound
  - Auto-deploy branch
  - Most recent successful deploy SHA
  - Environment variable list (names only — don't expose values)
- [ ] **Stripe webhook audit:** Stripe dashboard → Developers → Webhooks. Note the destination URL of every active webhook. If any point at `ai-stock-assist.onrender.com` (Streamlit) → flag for migration BEFORE decommissioning Streamlit.
- [ ] **Supabase callback URL audit:** Supabase Dashboard → Authentication → URL Configuration. Note site URL + redirect URLs. Confirm none point at the Streamlit service.

### Phase 1 — Convert Streamlit to redirect shell (LOW RISK)

This shrinks the Streamlit service to a tiny redirect page that says "Please visit aistockassist.com" — without deleting the Render service. Anyone hitting the old URL gets a graceful handoff.

- [ ] In `ai-stock-render` repo, replace `app.py` with a minimal Streamlit redirect (~50 lines, only `streamlit` as a dependency). Draft already exists in this conversation — can be regenerated.
- [ ] Trim `requirements.txt` to just `streamlit>=1.28.0`. Drops startup memory from ~400MB to ~80MB.
- [ ] Commit + push to `ai-stock-render` main → Render auto-deploys the Streamlit service.
- [ ] **Verify:** `curl -s https://ai-stock-assist.onrender.com | grep "AI Stock Assist has moved"` → expect a match.
- [ ] **Production check (CRITICAL):** re-verify `api.aistockassist.com/health` is still 200 (the API service is a separate Render service so this push should NOT affect it, but verify anyway).

### Phase 2 — Delete the orphan `ai-stock-assist-api` (MEDIUM RISK)

- [ ] **Re-confirm** `api.aistockassist.com` CNAME does NOT point at this service (re-run the DNS check from Phase 0).
- [ ] **Check Render service connections:** if anything (cron jobs, scheduled tasks, external monitors) references `ai-stock-assist-api.onrender.com` → migrate or remove.
- [ ] In Render Dashboard → `ai-stock-assist-api` → **Suspend** (NOT delete) the service. Verify production still works for 24h.
- [ ] If 24h later production is still healthy → click **Delete** in Render Dashboard.
- [ ] Update `render.yaml` in `ai-stock-render` repo to remove the `ai-stock-assist-api` service definition (rename the actual live one to match it if you want to consolidate names — but that requires DNS-cutover planning, see Phase 4).

### Phase 3 — Decommission Streamlit `ai-stock-assist` service (LOW RISK after Phase 1)

After 2 weeks of the redirect shell being live (June ~15), nobody should be relying on the Streamlit service for actual functionality.

- [ ] Check Render service metrics for `ai-stock-assist` → look at request count over the past 14 days. If it's all redirects (no POST traffic) → safe to delete.
- [ ] In Render Dashboard → `ai-stock-assist` → **Suspend** for 7 days as a safety window.
- [ ] If no support requests during the suspension → **Delete**.
- [ ] Remove the Streamlit service block from `render.yaml`.
- [ ] Delete `app.py`, `auth/`, `payments/`, the legacy `.streamlit/` directory from `ai-stock-render` repo. Git history preserves everything if ever needed.

### Phase 4 — (Optional) Rename `ai-stock-render-api` → `ai-stock-assist-api`

Skip this unless it bothers you. Renaming the live service requires coordinating DNS cutover with Render's URL aliasing. Higher risk than it's worth for a cosmetic improvement. If pursued:

- [ ] Create a NEW service `ai-stock-assist-api` from the same repo + branch (so it has the new name from day 1).
- [ ] Wait for it to deploy and pass health checks.
- [ ] Move custom domain `api.aistockassist.com` from old service to new service (Render Dashboard → old service → Custom Domains → remove → add to new service).
- [ ] **Immediate production check:** `curl https://api.aistockassist.com/health` must return 200.
- [ ] Watch traffic + errors for 24h.
- [ ] Delete the old `ai-stock-render-api` service.

---

## Expected savings

| Action | Monthly savings |
|---|---|
| Delete `ai-stock-assist-api` (orphan FastAPI) | ~$10 |
| Delete `ai-stock-assist` (Streamlit, after redirect-shell window) | ~$10 |
| **Total** | **~$20/month · ~$240/year** |

---

## Rollback playbook (for any phase)

If anything starts misbehaving during cleanup:

1. **Don't delete — suspend.** Render's Suspend keeps the service deployable; Delete is permanent (you'd have to recreate from `render.yaml`).
2. **Restore DNS first.** If `api.aistockassist.com` ever points at the wrong place, re-point the CNAME at `ai-stock-render-api.onrender.com` before doing anything else.
3. **Git is the source of truth.** Any code change can be reverted with `git revert` + push. Auto-deploy will redeploy the old code in ~3 min.

---

## When to revisit this plan

- Beginning of June 2026 (set a calendar reminder)
- OR sooner if Render billing becomes a concern
- OR sooner if today's `render.yaml` vs DNS mismatch causes another incident
