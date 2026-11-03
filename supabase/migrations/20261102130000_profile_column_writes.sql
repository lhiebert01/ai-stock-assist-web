-- Least-privilege API grants for ai-stock-analyzer (founder ruling, Nov 2, 2026). Revokes TRUNCATE, REFERENCES,
-- TRIGGER and every table privilege the app does not use from anon and authenticated, then grants back
-- exactly what the app's own calls need (supabase/api-grants.json). Row-level security and policies are
-- unchanged unless stated below. No rows are read, changed or deleted. service_role is unchanged.
-- Second pass: column-level writes on user_profiles, and an insert policy that stops a user from creating their own row as admin.

do $r$ declare t record; begin
  for t in select c.relname, c.relkind from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relkind in ('r','v','m','p','S') loop
    if t.relkind = 'S' then execute format('revoke all on sequence public.%I from anon, authenticated', t.relname);
    else execute format('revoke all on table public.%I from anon, authenticated', t.relname); end if;
  end loop; end $r$;

grant delete, insert, select on table public.analysis_history to authenticated;
grant select on table public.user_profiles to authenticated;
grant delete, insert, select, update on table public.watchlists to authenticated;

-- Column-level writes: the role may write only the columns the app writes (row-level security still
-- limits which rows).
grant insert (email, id, is_admin, username) on table public.user_profiles to authenticated;
grant update (analyses_total_lifetime, credits_remaining) on table public.user_profiles to authenticated;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;

-- is_admin() reads user_profiles.is_admin, so a user who could set it on their own row became an
-- admin (read and update every profile). The browser sets it at signup for the admin email only.
drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile" on public.user_profiles for insert to authenticated
  with check (auth.uid() = id and (is_admin is not true or lower(auth.jwt() ->> 'email') = 'lindsay.hiebert@gmail.com'));
