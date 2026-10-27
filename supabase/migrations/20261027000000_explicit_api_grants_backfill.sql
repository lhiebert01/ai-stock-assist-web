-- WO-SUPABASE-GRANTS-001: explicit Data API grants backfill for Supabase project ai-stock-analyzer (gcuvtpccyotujnuufxod).
--
-- From October 30, 2026, Supabase no longer grants API access (anon, authenticated, service_role)
-- to new tables, views, sequences and functions in public. Replaying this project's SQL onto a
-- fresh project, a branch or a local reset would then create objects the API cannot reach.
-- Applied after every other schema file, this file restores exactly the grants production held
-- on 2026-10-27: generated from production (helper Q4 for tables, views and sequences; Q5 for
-- function EXECUTE grants), never typed by hand, so it broadens nothing. Each statement runs only
-- if its object exists, so the file is idempotent and a no-op on production.
--
-- Tables with RLS still need their policies, which live in the files that create them.
-- Objects in production that no SQL file in the repo creates (made in the dashboard): users.
-- They are covered here if they exist; recreating them needs their own definitions.

-- Tables, views and sequences (Q4): 18 grants
do $g$ begin if to_regclass('public.analysis_history') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.analysis_history to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.analysis_history') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.analysis_history to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.analysis_history') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.analysis_history to service_role'; end if; end $g$;
do $g$ begin if to_regclass('public.analysis_history_id_seq') is not null then execute 'grant SELECT, UPDATE, USAGE on sequence public.analysis_history_id_seq to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.analysis_history_id_seq') is not null then execute 'grant SELECT, UPDATE, USAGE on sequence public.analysis_history_id_seq to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.analysis_history_id_seq') is not null then execute 'grant SELECT, UPDATE, USAGE on sequence public.analysis_history_id_seq to service_role'; end if; end $g$;
do $g$ begin if to_regclass('public.score_log') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.score_log to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.score_log') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.score_log to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.score_log') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.score_log to service_role'; end if; end $g$;
do $g$ begin if to_regclass('public.user_profiles') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.user_profiles to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.user_profiles') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.user_profiles to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.user_profiles') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.user_profiles to service_role'; end if; end $g$;
do $g$ begin if to_regclass('public.users') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.users to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.users') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.users to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.users') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.users to service_role'; end if; end $g$;
do $g$ begin if to_regclass('public.watchlists') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.watchlists to anon'; end if; end $g$;
do $g$ begin if to_regclass('public.watchlists') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.watchlists to authenticated'; end if; end $g$;
do $g$ begin if to_regclass('public.watchlists') is not null then execute 'grant DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on table public.watchlists to service_role'; end if; end $g$;

-- Function EXECUTE grants (Q5): 6 grants
do $g$ begin if to_regprocedure('public.is_admin()') is not null then execute 'grant execute on function public.is_admin() to anon'; end if; end $g$;
do $g$ begin if to_regprocedure('public.is_admin()') is not null then execute 'grant execute on function public.is_admin() to authenticated'; end if; end $g$;
do $g$ begin if to_regprocedure('public.is_admin()') is not null then execute 'grant execute on function public.is_admin() to service_role'; end if; end $g$;
do $g$ begin if to_regprocedure('public.score_log_immutable()') is not null then execute 'grant execute on function public.score_log_immutable() to anon'; end if; end $g$;
do $g$ begin if to_regprocedure('public.score_log_immutable()') is not null then execute 'grant execute on function public.score_log_immutable() to authenticated'; end if; end $g$;
do $g$ begin if to_regprocedure('public.score_log_immutable()') is not null then execute 'grant execute on function public.score_log_immutable() to service_role'; end if; end $g$;
