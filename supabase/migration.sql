-- =============================================================================
-- AI Stock Assist — Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- 1. USER PROFILES TABLE
-- Linked to Supabase Auth (auth.users) via foreign key
create table if not exists public.user_profiles (
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

-- Indexes for common queries
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_stripe on public.user_profiles(stripe_customer_id);

-- 2. ANALYSIS HISTORY TABLE
create table if not exists public.analysis_history (
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
create index if not exists idx_analysis_history_user on public.analysis_history(user_id);
create index if not exists idx_analysis_history_created on public.analysis_history(created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on both tables
alter table public.user_profiles enable row level security;
alter table public.analysis_history enable row level security;

-- USER PROFILES policies
-- Users can read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (except is_admin)
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile (on first login)
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can update all profiles (for credit adjustments)
create policy "Admins can update all profiles"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ANALYSIS HISTORY policies
-- Users can read their own history
create policy "Users can read own history"
  on public.analysis_history for select
  using (auth.uid() = user_id);

-- Users can insert their own history
create policy "Users can insert own history"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

-- Users can delete their own history
create policy "Users can delete own history"
  on public.analysis_history for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- SERVICE ROLE ACCESS (for Stripe webhook — bypasses RLS)
-- The webhook uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS automatically.
-- No additional policies needed for webhook credit updates.
-- =============================================================================

-- =============================================================================
-- OPTIONAL: Set your admin user after first signup
-- Replace 'your-user-uuid' with the actual UUID from auth.users
-- =============================================================================
-- update public.user_profiles set is_admin = true where email = 'lindsay.hiebert@gmail.com';
