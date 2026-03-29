-- =============================================================================
-- AI Stock Assist — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
--
-- NOTE: This project shares a Supabase instance with the existing Streamlit app.
-- The old app uses a "users" table (VARCHAR IDs, custom auth).
-- The new React app uses "user_profiles" (UUID IDs, Supabase Auth).
-- Both tables coexist — they do NOT conflict.
-- =============================================================================

-- Clean up any previous attempts (drops table + all policies/indexes)
drop table if exists public.analysis_history cascade;
drop table if exists public.user_profiles cascade;

-- 1. USER PROFILES TABLE
-- Linked to Supabase Auth (auth.users) via UUID foreign key
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  credits_remaining integer not null default 3,
  credits_lifetime integer not null default 0,
  stripe_customer_id text,
  total_purchases integer not null default 0,
  total_spent_cents integer not null default 0,
  analyses_total_lifetime integer not null default 0,
  unique_tickers_lifetime integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_login timestamptz
);

-- Indexes
create index idx_user_profiles_email on public.user_profiles(email);
create index idx_user_profiles_stripe on public.user_profiles(stripe_customer_id);

-- 2. ANALYSIS HISTORY TABLE
create table public.analysis_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  tickers text[] not null,
  methodology text not null default 'Growth & Quality',
  snapshots jsonb,
  recommendation jsonb,
  comparative_analysis text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_analysis_history_user on public.analysis_history(user_id);
create index idx_analysis_history_created on public.analysis_history(created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

alter table public.user_profiles enable row level security;
alter table public.analysis_history enable row level security;

-- USER PROFILES policies
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.is_admin = true
    )
  );

create policy "Admins can update all profiles"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.is_admin = true
    )
  );

-- ANALYSIS HISTORY policies
create policy "Users can read own history"
  on public.analysis_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own history"
  on public.analysis_history for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SERVICE ROLE ACCESS (for Stripe webhook — bypasses RLS automatically)
-- No additional policies needed.
-- =============================================================================

-- =============================================================================
-- AFTER FIRST SIGNUP: Set yourself as admin
-- =============================================================================
-- update public.user_profiles set is_admin = true where email = 'lindsay.hiebert@gmail.com';
