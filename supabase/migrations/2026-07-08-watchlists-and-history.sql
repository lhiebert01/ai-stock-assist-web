-- Watchlists (Phase II engagement feature) + history Bottom-Line persistence.
-- Run in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- Both changes are additive and safe to run on the live database.

-- 1. Persist the plain-English "Bottom Line" summary with each saved analysis
--    (the frontend already writes it when the column exists, and falls back
--    gracefully when it doesn't).
alter table public.analysis_history
  add column if not exists plain_summary text;

-- 2. Watchlists — one row per (user, ticker), owner-only via RLS.
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticker text not null,
  note text,
  last_price numeric,          -- price at the time it was added / last analyzed
  last_rating text,            -- BUY/HOLD/SELL/NOT_RATED at that time
  added_at timestamptz not null default now(),
  unique (user_id, ticker)
);

alter table public.watchlists enable row level security;

drop policy if exists "watchlists_owner_all" on public.watchlists;
create policy "watchlists_owner_all" on public.watchlists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
