-- Least-privilege API grants for ai-stock-analyzer (founder ruling, Nov 2, 2026). Revokes TRUNCATE, REFERENCES,
-- TRIGGER and every table privilege the app does not use from anon and authenticated, then grants back
-- exactly what the app's own calls need (supabase/api-grants.json). Row-level security and policies are
-- unchanged unless stated below. No rows are read, changed or deleted. service_role is unchanged.

do $r$ declare t record; begin
  for t in select c.relname, c.relkind from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind in ('r','v','m','p','S') loop
    if t.relkind = 'S' then execute format('revoke all on sequence public.%I from anon, authenticated', t.relname);
    else execute format('revoke all on table public.%I from anon, authenticated', t.relname); end if;
  end loop; end $r$;

grant delete, insert, select on table public.analysis_history to authenticated;
grant insert, select, update on table public.user_profiles to authenticated;
grant delete, insert, select, update on table public.watchlists to authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
