-- Forward score log (MVQ validation protocol — owner directives Jul 9 2026,
-- incl. the PROVENANCE ADDENDUM). Run in the Supabase SQL editor.
-- Service-role writes only (RLS enabled with no public policies).
--
-- PROVENANCE RULES (integrity-tier):
--  * Metadata is written once, at scoring time, by the scoring engine.
--  * Records are APPEND-ONLY: UPDATE and DELETE are rejected by trigger
--    (a database policy, not an app-code convention).
--  * scoring_version defaults to 'unversioned' — a first-class value; such
--    records are permanently excluded by the validation ingest filter and
--    never backfilled or inferred.

create table if not exists public.score_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ticker text not null,
  framework text not null,               -- wire methodology id
  scoring_version text not null default 'unversioned',  -- engine-emitted constant
  rating text not null,                  -- BUY / HOLD / SELL / NOT_RATED
  state text,                            -- RATED / RATED_WITH_CAVEATS / NOT_RATED
  confidence text,
  score numeric,
  max_score numeric,
  criteria jsonb,                        -- per-check raw values + credits
  near_misses jsonb,
  snapshot_id uuid,                      -- ties evaluations to ONE fetched snapshot
  vintage jsonb,                         -- period / statement_date / prices_as_of
  price numeric,
  integrity_status text,
  cohort_id text,                        -- null until WO-ASA-004.6 cohorts ship
  user_id uuid                           -- optional; for dedup, not analytics
);

create index if not exists score_log_ticker_created on public.score_log (ticker, created_at desc);
create index if not exists score_log_version on public.score_log (scoring_version);

alter table public.score_log enable row level security;
-- no policies on purpose: only the service role reads/writes

-- Append-only enforcement (provenance addendum rule 2/5): reject ALL updates
-- and deletes at the database layer. If a record is wrong, it stays wrong and
-- gets excluded by the ingest filter with a reason code — never "fixed".
create or replace function public.score_log_immutable() returns trigger as $$
begin
  raise exception 'score_log is append-only (provenance rule): % rejected', TG_OP;
end $$ language plpgsql;

drop trigger if exists score_log_no_mutation on public.score_log;
create trigger score_log_no_mutation
  before update or delete on public.score_log
  for each row execute function public.score_log_immutable();

-- VERIFICATION TEST (provenance rule 5) — run after creating; BOTH must ERROR:
--   update public.score_log set scoring_version = 'x' where false or true;
--   delete from public.score_log where true;
